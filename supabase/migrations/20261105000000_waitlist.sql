-- SOLSTICE pre-launch waitlist.
--
-- Apply once to the Supabase project (SQL editor, or `supabase db push`).
-- See docs/waitlist.md for the lifecycle, retention and operating notes.
--
-- Access model: these tables are only ever read and written by the Next.js
-- server using a privileged database connection (DATABASE_URL). Row level
-- security is enabled with NO policies, and all privileges are revoked from
-- Supabase's public API roles, so subscriber data can never be reached through
-- the public Supabase REST/GraphQL API or the anon key.

-- ---------------------------------------------------------------- subscribers
create table if not exists public.waitlist_subscribers (
  id                    uuid primary key default gen_random_uuid(),

  -- Normalised (trimmed, lower-cased) address. One row per address; an
  -- unsubscribed person who signs up again reuses their row.
  email                 text not null,
  fragrance_preference  text not null default 'all',

  -- pending      signed up, has NOT yet confirmed by email (no marketing allowed)
  -- confirmed    completed double opt-in (the only status marketing may use)
  -- unsubscribed opted out; row kept only so the opt-out can be honoured
  status                text not null default 'pending',

  -- Consent record for the current subscription.
  consent_marketing     boolean not null,
  consent_version       text not null,
  consent_at            timestamptz not null,

  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  confirmation_sent_at  timestamptz,
  confirmed_at          timestamptz,
  unsubscribed_at       timestamptz,

  constraint waitlist_email_is_normalised
    check (email = lower(btrim(email)) and char_length(email) between 3 and 254),
  constraint waitlist_fragrance_preference_valid
    check (fragrance_preference in ('all', 'aurora', 'eclipse', 'corona', 'nocturne')),
  constraint waitlist_status_valid
    check (status in ('pending', 'confirmed', 'unsubscribed')),
  constraint waitlist_consent_is_given
    check (consent_marketing is true),
  constraint waitlist_confirmed_has_timestamp
    check (status <> 'confirmed' or confirmed_at is not null),
  constraint waitlist_unsubscribed_has_timestamp
    check (status <> 'unsubscribed' or unsubscribed_at is not null)
);

-- The duplicate guard: the database, not application code, guarantees that an
-- address can never appear twice, even under concurrent requests.
create unique index if not exists waitlist_subscribers_email_key
  on public.waitlist_subscribers (email);

create index if not exists waitlist_subscribers_status_idx
  on public.waitlist_subscribers (status);

create or replace function public.waitlist_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists waitlist_subscribers_touch_updated_at on public.waitlist_subscribers;
create trigger waitlist_subscribers_touch_updated_at
  before update on public.waitlist_subscribers
  for each row execute function public.waitlist_touch_updated_at();

-- --------------------------------------------------------------------- events
-- Append-only audit trail of the subscription lifecycle. It deliberately holds
-- NO email address: only the pseudonymous subscriber id, so it survives an
-- erasure request without keeping personal data.
create table if not exists public.waitlist_events (
  id             bigint generated always as identity primary key,
  subscriber_id  uuid,
  event_type     text not null,
  meta           jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now(),

  constraint waitlist_event_type_valid check (event_type in (
    'signup_requested',
    'confirmation_sent',
    'confirmation_failed',
    'confirmed',
    'duplicate_signup',
    'resubscribe_requested',
    'preference_updated',
    'unsubscribed',
    'erased',
    'purged'
  ))
);

create index if not exists waitlist_events_subscriber_idx
  on public.waitlist_events (subscriber_id, created_at);

-- ---------------------------------------------------------------- rate limits
-- Fixed-window counters shared by every serverless instance. Keys are keyed
-- hashes (never raw IP addresses or emails).
create table if not exists public.waitlist_rate_limits (
  key           text primary key,
  window_start  timestamptz not null,
  hits          integer not null
);

-- ------------------------------------------------------------------- lockdown
alter table public.waitlist_subscribers enable row level security;
alter table public.waitlist_events      enable row level security;
alter table public.waitlist_rate_limits enable row level security;

do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on public.waitlist_subscribers from anon;
    revoke all on public.waitlist_events      from anon;
    revoke all on public.waitlist_rate_limits from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on public.waitlist_subscribers from authenticated;
    revoke all on public.waitlist_events      from authenticated;
    revoke all on public.waitlist_rate_limits from authenticated;
  end if;
end
$$;

-- ------------------------------------------------------------------ retention
-- Deletes sign-ups that were never confirmed within `pending_max_age`, and old
-- rate-limit counters. Returns the number of subscribers removed. Run it on a
-- schedule (see docs/waitlist.md); it is not scheduled automatically.
create or replace function public.waitlist_purge_stale(
  pending_max_age interval default interval '30 days'
)
returns integer
language plpgsql
as $$
declare
  removed integer;
begin
  with gone as (
    delete from public.waitlist_subscribers
    where status = 'pending'
      and created_at < now() - pending_max_age
    returning id
  ), logged as (
    insert into public.waitlist_events (subscriber_id, event_type, meta)
    select id, 'purged', '{"reason":"unconfirmed"}'::jsonb from gone
  )
  select count(*) into removed from gone;

  delete from public.waitlist_rate_limits
  where window_start < now() - interval '1 day';

  return removed;
end;
$$;

revoke all on function public.waitlist_purge_stale(interval) from public;
