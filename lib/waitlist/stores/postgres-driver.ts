import "server-only";

import postgres from "postgres";

import type { SqlExecutor } from "./postgres";

/**
 * Connects to Postgres (Supabase) with postgres.js.
 *
 * Use Supabase's *transaction pooler* connection string for DATABASE_URL: it is
 * the one meant for serverless functions. `prepare: false` is required in
 * transaction-pooling mode, and `max: 1` keeps each function instance to one
 * connection.
 */
const globalForDb = globalThis as unknown as { __solsticeWaitlistSql?: postgres.Sql };

export function createPostgresExecutor(connectionString: string): SqlExecutor {
  const client =
    globalForDb.__solsticeWaitlistSql ??
    postgres(connectionString, {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString) ? false : "require",
    });
  globalForDb.__solsticeWaitlistSql = client;

  return {
    async query(text, params = []) {
      const rows = await client.unsafe(text, params as postgres.ParameterOrJSON<never>[]);
      return rows as unknown as Record<string, unknown>[];
    },
  };
}
