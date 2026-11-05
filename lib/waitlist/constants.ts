/**
 * Shared waitlist constants. Safe to import from client components: nothing
 * here is secret.
 */

export const FRAGRANCE_PREFERENCES = [
  "all",
  "aurora",
  "eclipse",
  "corona",
  "nocturne",
] as const;
export type FragrancePreference = (typeof FRAGRANCE_PREFERENCES)[number];

/**
 * Version of the consent wording and privacy notice a subscriber agreed to.
 * Bump it whenever either text changes; it is stored with every consent record.
 */
export const CONSENT_VERSION = "2026-11-05";

export const CONSENT_LABEL =
  "I agree to receive SOLSTICE fragrance development updates and launch announcements by email. I can unsubscribe at any time.";

export const EMAIL_MAX_LENGTH = 254;
export const REQUEST_BODY_MAX_BYTES = 4096;

/** A human cannot fill in the form faster than this; scripts often can. */
export const MIN_FILL_MS = 800;

/** Confirmation links stop working after this long (a new one can be requested). */
export const CONFIRM_TTL_SECONDS = 7 * 24 * 60 * 60;

/** Do not re-send the confirmation email for a pending address more often than this. */
export const RESEND_COOLDOWN_SECONDS = 5 * 60;

/** Unconfirmed sign-ups are removed after this many days (see waitlist_purge_stale). */
export const PENDING_RETENTION_DAYS = 30;

export const RATE_LIMITS = {
  signupPerIp: { max: 5, windowSeconds: 10 * 60 },
  signupPerEmail: { max: 3, windowSeconds: 60 * 60 },
  tokenActionPerIp: { max: 20, windowSeconds: 10 * 60 },
} as const;
