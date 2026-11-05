# SOLSTICE waitlist

Pre-launch email waitlist with double opt-in. This document covers how it works,
what you must set up before it can accept real sign-ups, and what is **not yet
live**.

## Status at a glance

| Part | State |
| --- | --- |
| Form, pages, API routes, validation, anti-abuse | Built and tested locally |
| Database schema (Supabase / Postgres) | Written and tested against a real Postgres engine (PGlite). **Not applied to any Supabase project.** |
| Confirmation email (Resend) | Request shape tested against a stub. **Never sent through Resend; no account or domain exists yet.** |
| Production waitlist | **Not live.** Until the four required variables are set, the form is replaced by "The waitlist isn't open yet" and the API answers `503`. No data is saved and no success is shown. |

Nothing here sends marketing email. The code only sends the one confirmation
email, and only after a person has submitted the form with the consent box
ticked. A separate step (below) is needed to email subscribers.

## How it behaves

```
 form (consent ticked) ──► POST /api/waitlist ──► row: status = pending
                                   │
                                   └─► confirmation email (signed link)
 click link ─► /waitlist/confirm ─► [Confirm] button ─► POST /api/waitlist/confirm
                                                            └─► status = confirmed
 any email ─► /waitlist/unsubscribe ─► [Unsubscribe] (+ optional "delete my data")
                                            └─► status = unsubscribed, or row erased
```

* **Double opt-in.** A person is `pending` until they follow the emailed link and
  press the button. Only `confirmed` rows may be emailed.
* **Links never act on open.** Confirm and unsubscribe links open a page with a
  button. Mail scanners that pre-fetch links therefore cannot confirm or
  unsubscribe anyone. Mail apps that support RFC 8058 one-click unsubscribe use
  `POST /api/waitlist/unsubscribe?token=…`, which can only unsubscribe.
* **Tokens are stateless.** HMAC-SHA256 signed with `WAITLIST_TOKEN_SECRET`;
  confirm links expire after 7 days, unsubscribe links do not.
* **Unsubscribe and deletion.** Unsubscribing keeps the address marked
  `unsubscribed` (a suppression record, so it is not re-added by mistake).
  Ticking "also delete my data" erases the row. A person may sign up again later;
  that restarts the flow with fresh consent.
* **What is stored.** Normalised email, fragrance preference, consent flag, consent
  wording version and timestamp, signup / confirmation-sent / confirmed /
  unsubscribed timestamps. `waitlist_events` is an audit log of lifecycle events
  that holds **no email address**, only a pseudonymous subscriber id.
* **Anti-abuse.** Same-origin check, 4 KB body cap, hidden honeypot field,
  minimum fill time, and Postgres-backed rate limits on hashed keys (sign-ups:
  5 per IP / 10 min and 3 per email / hour; token actions: 20 per IP / 10 min).
  A tripped honeypot returns a generic error, never a fake success.
* **Logging.** Only error names and codes are logged, never messages, because
  database errors can quote the offending email.
* **Duplicates.** A confirmed address that signs up again is told
  "You're already on the list". That is a deliberate usability choice and it lets
  someone probe whether an address is subscribed. To avoid that, return
  `pending_confirmation` instead of `already_subscribed` in `lib/waitlist/service.ts`
  (one line). Re-submitting while still pending sends no new email inside a
  5-minute cooldown.
* **Failure.** If the email provider fails, the row stays `pending`, the visitor
  sees an error (never a success), and they can retry.

## Setup (what you need to do)

### 1. Supabase (database)

1. Create a project at <https://supabase.com>.
2. Open **SQL Editor**, paste `supabase/migrations/20261105000000_waitlist.sql`, run it.
   It is idempotent. It enables row-level security with no policies and revokes
   access from `anon` / `authenticated`, so the public API keys cannot read the
   tables. The app connects directly with the database role instead.
3. **Project Settings → Database → Connection string → Transaction pooler**. Copy it
   (port `6543`), put your database password in, and use it as `DATABASE_URL`.

Do not use the `anon` or `service_role` API keys for this; they are not needed
and must never be exposed to the browser.

### 2. Resend (email)

1. Create an account at <https://resend.com> and an API key (`RESEND_API_KEY`).
2. **Add and verify a sending domain you own** (DNS records). Resend only delivers to
   arbitrary recipients from a verified domain, and a `*.vercel.app` address cannot
   be verified. Until you have a domain, real subscribers will not receive the
   confirmation email, so the waitlist should stay closed.
3. Set `WAITLIST_EMAIL_FROM` to an address on that domain, for example
   `SOLSTICE <hello@mail.example.com>`.

### 3. Secrets and environment variables

Generate the token secret: `openssl rand -base64 48`.

Add these in Vercel (**Project Settings → Environment Variables**), for Preview
and/or Production as you decide:

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | Supabase transaction-pooler connection string |
| `WAITLIST_TOKEN_SECRET` | yes | 32+ chars, signs email links |
| `RESEND_API_KEY` | yes | Sends the confirmation email |
| `WAITLIST_EMAIL_FROM` | yes | Verified sender |
| `WAITLIST_BASE_URL` | no | Origin used in emailed links (defaults to `config/site.ts`) |
| `WAITLIST_PRIVACY_CONTACT` | no | Address shown on `/privacy` for data questions |

Redeploy after changing them. All are read at request time, so the build itself
needs none of them. They are server-only; no `NEXT_PUBLIC_` variables are used.

### 4. Schedule the clean-up

`/privacy` promises that addresses never confirmed are deleted after 30 days.
Nothing runs that automatically until you schedule it. In Supabase: **Database →
Extensions → enable `pg_cron`**, then in the SQL Editor:

```sql
select cron.schedule('waitlist-purge', '17 3 * * *', $$select public.waitlist_purge_stale()$$);
```

(The function also removes expired rate-limit counters.)

### 5. Review the privacy notice

`/privacy` and the consent wording (`lib/waitlist/constants.ts`, `CONSENT_VERSION`)
are a good-faith draft written without knowing your legal entity, jurisdiction or
final retention policy. Have the owner (and counsel, if needed) review them before
launch. If the consent wording changes, bump `CONSENT_VERSION`.

## Emailing subscribers later

The code does not send announcements. When you do, send **only** to
`status = 'confirmed'` rows, and include each recipient's unsubscribe link:

```sql
select id, email, fragrance_preference
from waitlist_subscribers
where status = 'confirmed' and consent_marketing;
```

Generate the link with `signToken(WAITLIST_TOKEN_SECRET, "unsub", id)` from
`lib/waitlist/tokens.ts` and add the `List-Unsubscribe` headers as
`lib/waitlist/email/templates.ts` does. Do not email `pending` or `unsubscribed` rows.

## Subscriber data access

There is no admin UI and no public endpoint returns subscriber records. Read them
in the Supabase dashboard (Table Editor / SQL Editor). Manual deletion of a person
who writes to you: `delete from waitlist_subscribers where email = lower('x@y.z');`

## Running it locally with no accounts

```bash
# .env.local
WAITLIST_DRIVER=memory
WAITLIST_TOKEN_SECRET=<32+ random characters>
WAITLIST_DEV_OUTBOX_DIR=.waitlist-outbox
npm run dev
```

Sign-ups are held in memory and each "email" is written as a JSON file in
`.waitlist-outbox/` with the confirm and unsubscribe links inside. This mode is
refused when `VERCEL` is set, so it can never run in a deployment.

## Tests

```bash
npm run verify:waitlist
```

Runs validation, token, email-content and Resend request-shape checks, then one
lifecycle suite against both the in-memory store and the real SQL store on an
in-process Postgres (PGlite) with the actual migration applied, plus database
constraint, row-level-security, purge and idempotent-migration checks. It does
not talk to Supabase or Resend.

## Not done / needs the owner

* No Supabase project, Resend account, verified domain or Vercel variables exist yet.
  The live flow has therefore **never been run** against the real services.
* The `pg_cron` purge is not scheduled.
* Privacy notice, retention periods and consent wording await owner / legal review.
* No admin UI, export, or announcement-sending tool.
* The explicit "already on the list" response (see Duplicates) is a decision to confirm.
