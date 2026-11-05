import "server-only";

import { siteConfig } from "@/config/site";

import { createFileOutboxSender } from "./email/outbox";
import { createResendSender } from "./email/resend";
import type { WaitlistDeps } from "./service";
import { createMemoryStore } from "./stores/memory";
import { createPostgresStore } from "./stores/postgres";
import { createPostgresExecutor } from "./stores/postgres-driver";

/**
 * Turns environment variables into a working waitlist, or says plainly that
 * there isn't one. This is the only place the waitlist reads its configuration,
 * and it does so when a request arrives, never at import or build time, so a
 * production build needs no secrets.
 *
 * Rule: if anything required is missing the waitlist is UNAVAILABLE. It never
 * pretends to accept sign-ups it cannot store or confirm.
 *
 * Production configuration (see docs/waitlist.md):
 *   DATABASE_URL, WAITLIST_TOKEN_SECRET, RESEND_API_KEY, WAITLIST_EMAIL_FROM
 *
 * Local development only (refused whenever VERCEL is set):
 *   WAITLIST_DRIVER=memory, WAITLIST_TOKEN_SECRET, WAITLIST_DEV_OUTBOX_DIR
 */
export type WaitlistRuntime =
  | { available: true; deps: WaitlistDeps; mode: "postgres" | "memory" }
  | { available: false; missing: string[] };

const MIN_SECRET_LENGTH = 32;

const globalForWaitlist = globalThis as unknown as {
  __solsticeMemoryStore?: ReturnType<typeof createMemoryStore>;
  __solsticeWarned?: string;
};

export function getWaitlistRuntime(): WaitlistRuntime {
  const env = process.env;
  const missing: string[] = [];

  const secret = env.WAITLIST_TOKEN_SECRET ?? "";
  if (secret.length < MIN_SECRET_LENGTH)
    missing.push("WAITLIST_TOKEN_SECRET (32+ characters)");

  const onVercel = Boolean(env.VERCEL);
  const wantsMemory = env.WAITLIST_DRIVER === "memory" && !onVercel;
  const baseUrl = (env.WAITLIST_BASE_URL || siteConfig.url).replace(/\/$/, "");

  let store: WaitlistDeps["store"] | null = null;
  let mode: "postgres" | "memory" = "postgres";

  if (env.DATABASE_URL) {
    store = createPostgresStore(createPostgresExecutor(env.DATABASE_URL));
  } else if (wantsMemory) {
    mode = "memory";
    globalForWaitlist.__solsticeMemoryStore ??= createMemoryStore();
    store = globalForWaitlist.__solsticeMemoryStore;
  } else {
    missing.push("DATABASE_URL");
  }

  let email: WaitlistDeps["email"] | null = null;
  if (env.RESEND_API_KEY && env.WAITLIST_EMAIL_FROM) {
    email = createResendSender({
      apiKey: env.RESEND_API_KEY,
      from: env.WAITLIST_EMAIL_FROM,
    });
  } else if (wantsMemory && !env.DATABASE_URL && env.WAITLIST_DEV_OUTBOX_DIR) {
    email = createFileOutboxSender(env.WAITLIST_DEV_OUTBOX_DIR);
  } else {
    if (!env.RESEND_API_KEY) missing.push("RESEND_API_KEY");
    if (!env.WAITLIST_EMAIL_FROM) missing.push("WAITLIST_EMAIL_FROM");
  }

  if (missing.length > 0 || !store || !email) {
    const summary = missing.join(", ");
    if (globalForWaitlist.__solsticeWarned !== summary) {
      globalForWaitlist.__solsticeWarned = summary;
      console.warn(
        `[waitlist] not configured; sign-ups are disabled. Missing: ${summary}`
      );
    }
    return { available: false, missing };
  }

  return { available: true, mode, deps: { store, email, tokenSecret: secret, baseUrl } };
}
