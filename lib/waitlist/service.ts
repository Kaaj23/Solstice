import {
  CONFIRM_TTL_SECONDS,
  CONSENT_VERSION,
  RATE_LIMITS,
  RESEND_COOLDOWN_SECONDS,
} from "./constants";
import { buildConfirmationEmail } from "./email/templates";
import { hashKey, signToken, verifyToken } from "./tokens";
import type {
  ConsentRecord,
  EmailSender,
  Subscriber,
  WaitlistEventType,
  WaitlistStore,
} from "./types";
import type { SignupInput } from "./validation";

/**
 * The subscription lifecycle. Pure application logic: it talks to a
 * `WaitlistStore` and an `EmailSender` it is given, and reads no environment
 * variables, so it is identical in production and in tests.
 *
 *   signup  ->  pending  --confirm-->  confirmed  --unsubscribe-->  unsubscribed
 *                  \--unsubscribe-------------------------------------^
 *   unsubscribed --signup again (fresh consent)--> pending
 *
 * Only `confirmed` subscribers may receive marketing.
 */
export interface WaitlistDeps {
  store: WaitlistStore;
  email: EmailSender;
  tokenSecret: string;
  /** Absolute origin used in emailed links, e.g. https://solstice-virid.vercel.app */
  baseUrl: string;
  now?: () => Date;
}

export type SignupResult =
  | { kind: "pending_confirmation" }
  | { kind: "already_subscribed" }
  | { kind: "rate_limited"; retryAfterSeconds: number }
  | { kind: "email_failed" };

export type ConfirmResult =
  | { kind: "confirmed"; alreadyConfirmed: boolean }
  | { kind: "invalid" }
  | { kind: "expired" };

export type UnsubscribeResult =
  | { kind: "unsubscribed" }
  | { kind: "erased" }
  | { kind: "invalid" };

const nowOf = (deps: WaitlistDeps) => (deps.now ?? (() => new Date()))();

/** Never log messages or details: database errors can quote the email address. */
export function logSafe(scope: string, error: unknown): void {
  const err = error as { name?: string; code?: string } | null;
  console.error(
    `[waitlist] ${scope}: ${err?.name ?? "Error"}${err?.code ? ` (${err.code})` : ""}`
  );
}

async function track(
  deps: WaitlistDeps,
  subscriberId: string | null,
  type: WaitlistEventType,
  meta?: Record<string, string | number | boolean>
) {
  try {
    await deps.store.recordEvent(subscriberId, type, meta);
  } catch (error) {
    // The consent record lives on the subscriber row; a missed audit event must
    // not undo a state change the person has already been told about.
    logSafe("audit event failed", error);
  }
}

export function buildLinks(deps: WaitlistDeps, subscriberId: string, expiresAt: number) {
  const confirmToken = signToken(deps.tokenSecret, "confirm", subscriberId, expiresAt);
  const unsubToken = signToken(deps.tokenSecret, "unsub", subscriberId);
  const base = deps.baseUrl.replace(/\/$/, "");
  return {
    confirmUrl: `${base}/waitlist/confirm?token=${confirmToken}`,
    unsubscribeUrl: `${base}/waitlist/unsubscribe?token=${unsubToken}`,
    oneClickUnsubscribeUrl: `${base}/api/waitlist/unsubscribe?token=${unsubToken}`,
    privacyUrl: `${base}/privacy`,
  };
}

async function sendConfirmation(
  deps: WaitlistDeps,
  subscriber: Subscriber
): Promise<boolean> {
  const now = nowOf(deps);
  const links = buildLinks(
    deps,
    subscriber.id,
    Math.floor(now.getTime() / 1000) + CONFIRM_TTL_SECONDS
  );
  try {
    await deps.email.send(
      buildConfirmationEmail({
        to: subscriber.email,
        fragrance: subscriber.fragrancePreference,
        ...links,
      })
    );
  } catch (error) {
    logSafe("confirmation email failed", error);
    await track(deps, subscriber.id, "confirmation_failed");
    return false;
  }
  await deps.store.markConfirmationSent(subscriber.id, now);
  await track(deps, subscriber.id, "confirmation_sent");
  return true;
}

/**
 * Handle a validated sign-up. `ipKey` must already be a keyed hash (see
 * `hashKey`), never a raw IP address.
 */
export async function signup(
  deps: WaitlistDeps,
  input: SignupInput,
  ctx: { ipKey: string }
): Promise<SignupResult> {
  const now = nowOf(deps);
  const { store } = deps;

  const perIp = RATE_LIMITS.signupPerIp;
  if ((await store.hit(`signup:ip:${ctx.ipKey}`, perIp.windowSeconds, now)) > perIp.max) {
    return { kind: "rate_limited", retryAfterSeconds: perIp.windowSeconds };
  }
  const perEmail = RATE_LIMITS.signupPerEmail;
  const emailKey = hashKey(deps.tokenSecret, `email:${input.email}`);
  if (
    (await store.hit(`signup:email:${emailKey}`, perEmail.windowSeconds, now)) >
    perEmail.max
  ) {
    return { kind: "rate_limited", retryAfterSeconds: perEmail.windowSeconds };
  }

  const consent: ConsentRecord = {
    fragrancePreference: input.fragrance,
    consentVersion: CONSENT_VERSION,
    consentAt: now,
  };

  let existing = await store.findByEmail(input.email);
  if (!existing) {
    const created = await store.insertIfAbsent(input.email, consent);
    if (created) {
      await track(deps, created.id, "signup_requested", { preference: input.fragrance });
      return (await sendConfirmation(deps, created))
        ? { kind: "pending_confirmation" }
        : { kind: "email_failed" };
    }
    // Lost a race with a concurrent identical sign-up: carry on as an existing address.
    existing = await store.findByEmail(input.email);
    if (!existing) throw new Error("subscriber vanished during sign-up");
  }

  switch (existing.status) {
    case "confirmed":
      await track(deps, existing.id, "duplicate_signup");
      return { kind: "already_subscribed" };

    case "unsubscribed": {
      const reopened = await store.reopen(existing.id, consent);
      if (!reopened) return signup(deps, input, ctx);
      await track(deps, reopened.id, "resubscribe_requested", {
        preference: input.fragrance,
      });
      return (await sendConfirmation(deps, reopened))
        ? { kind: "pending_confirmation" }
        : { kind: "email_failed" };
    }

    case "pending": {
      const refreshed = (await store.refreshPending(existing.id, consent)) ?? existing;
      if (existing.fragrancePreference !== input.fragrance) {
        await track(deps, existing.id, "preference_updated", {
          preference: input.fragrance,
        });
      }
      const last = refreshed.confirmationSentAt;
      const recentlySent =
        last !== null && now.getTime() - last.getTime() < RESEND_COOLDOWN_SECONDS * 1000;
      if (recentlySent) return { kind: "pending_confirmation" };
      return (await sendConfirmation(deps, refreshed))
        ? { kind: "pending_confirmation" }
        : { kind: "email_failed" };
    }
  }
}

/** Complete the double opt-in. Idempotent for an already-confirmed address. */
export async function confirm(deps: WaitlistDeps, token: string): Promise<ConfirmResult> {
  const now = nowOf(deps);
  const checked = verifyToken(
    deps.tokenSecret,
    token,
    "confirm",
    Math.floor(now.getTime() / 1000)
  );
  if (!checked.ok) return { kind: checked.reason };

  const confirmed = await deps.store.confirm(checked.subscriberId, now);
  if (confirmed) {
    await track(deps, confirmed.id, "confirmed", {
      consentVersion: confirmed.consentVersion,
    });
    return { kind: "confirmed", alreadyConfirmed: false };
  }

  // Not pending: either already confirmed (fine), or unsubscribed / deleted. An
  // old confirmation link must never quietly re-subscribe someone who opted out.
  const current = await deps.store.findById(checked.subscriberId);
  if (current?.status === "confirmed")
    return { kind: "confirmed", alreadyConfirmed: true };
  return { kind: "invalid" };
}

/** Opt out, and optionally erase the record entirely. Idempotent. */
export async function unsubscribe(
  deps: WaitlistDeps,
  token: string,
  options: { erase?: boolean } = {}
): Promise<UnsubscribeResult> {
  const now = nowOf(deps);
  const checked = verifyToken(
    deps.tokenSecret,
    token,
    "unsub",
    Math.floor(now.getTime() / 1000)
  );
  if (!checked.ok) return { kind: "invalid" };

  const id = checked.subscriberId;
  if (options.erase) {
    const removed = await deps.store.erase(id);
    if (removed) await track(deps, id, "erased");
    return { kind: "erased" };
  }

  const changed = await deps.store.unsubscribe(id, now);
  if (changed) await track(deps, id, "unsubscribed");
  // Already unsubscribed or already erased: the outcome the person wanted holds.
  return { kind: "unsubscribed" };
}
