import type { FragrancePreference } from "../constants";
import type {
  ConsentRecord,
  Subscriber,
  SubscriberStatus,
  WaitlistStore,
} from "../types";

/**
 * Postgres implementation of the waitlist store (Supabase in production).
 *
 * It only needs something that can run a parameterised query, so the same code
 * runs against the real database (postgres.js, see postgres-driver.ts) and
 * against an in-process Postgres (PGlite) in scripts/verify-waitlist.ts.
 *
 * All values are passed as bound parameters; no SQL is built from user input.
 */
export interface SqlExecutor {
  query(text: string, params?: unknown[]): Promise<Record<string, unknown>[]>;
}

const COLUMNS = `id, email, fragrance_preference, status, consent_version, consent_at,
  created_at, confirmation_sent_at, confirmed_at, unsubscribed_at`;

const toDate = (value: unknown): Date | null =>
  value === null || value === undefined
    ? null
    : new Date(value as string | number | Date);

function toSubscriber(row: Record<string, unknown>): Subscriber {
  return {
    id: String(row.id),
    email: String(row.email),
    fragrancePreference: row.fragrance_preference as FragrancePreference,
    status: row.status as SubscriberStatus,
    consentVersion: String(row.consent_version),
    consentAt: toDate(row.consent_at) as Date,
    createdAt: toDate(row.created_at) as Date,
    confirmationSentAt: toDate(row.confirmation_sent_at),
    confirmedAt: toDate(row.confirmed_at),
    unsubscribedAt: toDate(row.unsubscribed_at),
  };
}

const first = (rows: Record<string, unknown>[]): Subscriber | null =>
  rows[0] ? toSubscriber(rows[0]) : null;

const iso = (d: Date) => d.toISOString();

export function createPostgresStore(sql: SqlExecutor): WaitlistStore {
  return {
    async findByEmail(email) {
      return first(
        await sql.query(
          `select ${COLUMNS} from public.waitlist_subscribers where email = $1`,
          [email]
        )
      );
    },

    async findById(id) {
      return first(
        await sql.query(
          `select ${COLUMNS} from public.waitlist_subscribers where id = $1`,
          [id]
        )
      );
    },

    async insertIfAbsent(email, consent: ConsentRecord) {
      // The unique index on email makes this safe under concurrent requests:
      // exactly one caller inserts, every other caller gets no row back.
      return first(
        await sql.query(
          `insert into public.waitlist_subscribers
             (email, fragrance_preference, status, consent_marketing, consent_version, consent_at, created_at)
           values ($1, $2, 'pending', true, $3, $4::timestamptz, $4::timestamptz)
           on conflict (email) do nothing
           returning ${COLUMNS}`,
          [
            email,
            consent.fragrancePreference,
            consent.consentVersion,
            iso(consent.consentAt),
          ]
        )
      );
    },

    async refreshPending(id, consent) {
      return first(
        await sql.query(
          `update public.waitlist_subscribers
              set fragrance_preference = $2, consent_version = $3, consent_at = $4::timestamptz
            where id = $1 and status = 'pending'
            returning ${COLUMNS}`,
          [
            id,
            consent.fragrancePreference,
            consent.consentVersion,
            iso(consent.consentAt),
          ]
        )
      );
    },

    async reopen(id, consent) {
      return first(
        await sql.query(
          `update public.waitlist_subscribers
              set status = 'pending',
                  fragrance_preference = $2,
                  consent_version = $3,
                  consent_at = $4::timestamptz,
                  confirmation_sent_at = null,
                  confirmed_at = null,
                  unsubscribed_at = null
            where id = $1 and status = 'unsubscribed'
            returning ${COLUMNS}`,
          [
            id,
            consent.fragrancePreference,
            consent.consentVersion,
            iso(consent.consentAt),
          ]
        )
      );
    },

    async markConfirmationSent(id, at) {
      await sql.query(
        `update public.waitlist_subscribers
            set confirmation_sent_at = $2::timestamptz
          where id = $1 and status = 'pending'`,
        [id, iso(at)]
      );
    },

    async confirm(id, at) {
      return first(
        await sql.query(
          `update public.waitlist_subscribers
              set status = 'confirmed', confirmed_at = $2::timestamptz
            where id = $1 and status = 'pending'
            returning ${COLUMNS}`,
          [id, iso(at)]
        )
      );
    },

    async unsubscribe(id, at) {
      return first(
        await sql.query(
          `update public.waitlist_subscribers
              set status = 'unsubscribed', unsubscribed_at = $2::timestamptz
            where id = $1 and status <> 'unsubscribed'
            returning ${COLUMNS}`,
          [id, iso(at)]
        )
      );
    },

    async erase(id) {
      const rows = await sql.query(
        `delete from public.waitlist_subscribers where id = $1 returning id`,
        [id]
      );
      return rows.length > 0;
    },

    async recordEvent(subscriberId, type, meta = {}) {
      await sql.query(
        `insert into public.waitlist_events (subscriber_id, event_type, meta)
         values ($1, $2, $3::jsonb)`,
        [subscriberId, type, JSON.stringify(meta)]
      );
    },

    async hit(key, windowSeconds, now) {
      const rows = await sql.query(
        `insert into public.waitlist_rate_limits as r (key, window_start, hits)
         values ($1, $3::timestamptz, 1)
         on conflict (key) do update set
           hits = case
             when r.window_start <= $3::timestamptz - make_interval(secs => $2::double precision)
             then 1 else r.hits + 1 end,
           window_start = case
             when r.window_start <= $3::timestamptz - make_interval(secs => $2::double precision)
             then $3::timestamptz else r.window_start end
         returning hits`,
        [key, windowSeconds, iso(now)]
      );
      return Number(rows[0]?.hits ?? 1);
    },
  };
}
