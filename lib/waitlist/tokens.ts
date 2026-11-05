import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Stateless, signed action links for the double opt-in and unsubscribe flows.
 *
 * A token is `base64url(payload).base64url(hmac)`. The payload names the
 * purpose ("confirm" or "unsub"), the subscriber id and an optional expiry. The
 * HMAC covers the payload, so a token cannot be forged or re-purposed (a
 * confirm token never works as an unsubscribe token) without the server secret,
 * and nothing about it needs to be stored in the database.
 */

export type TokenPurpose = "confirm" | "unsub";

export type TokenCheck =
  | { ok: true; subscriberId: string }
  | { ok: false; reason: "invalid" | "expired" };

const DOMAIN = "solstice-waitlist:v1:";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

function sign(secret: string, payloadB64: string): Buffer {
  return createHmac("sha256", secret)
    .update(DOMAIN + payloadB64)
    .digest();
}

export function signToken(
  secret: string,
  purpose: TokenPurpose,
  subscriberId: string,
  /** Expiry as Unix seconds. Omit for a link that never expires (unsubscribe). */
  expiresAt?: number
): string {
  const payload = b64url(
    JSON.stringify({
      p: purpose,
      s: subscriberId,
      ...(expiresAt ? { e: expiresAt } : {}),
    })
  );
  return `${payload}.${b64url(sign(secret, payload))}`;
}

export function verifyToken(
  secret: string,
  token: string,
  purpose: TokenPurpose,
  nowSeconds: number
): TokenCheck {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "invalid" };
  const [payloadB64, sigB64] = parts as [string, string];

  let given: Buffer;
  try {
    given = Buffer.from(sigB64, "base64url");
  } catch {
    return { ok: false, reason: "invalid" };
  }
  const expected = sign(secret, payloadB64);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, reason: "invalid" };
  }

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8"));
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (typeof payload !== "object" || payload === null)
    return { ok: false, reason: "invalid" };

  const { p, s, e } = payload as { p?: unknown; s?: unknown; e?: unknown };
  if (p !== purpose || typeof s !== "string" || !UUID.test(s)) {
    return { ok: false, reason: "invalid" };
  }
  if (e !== undefined) {
    if (typeof e !== "number" || !Number.isFinite(e))
      return { ok: false, reason: "invalid" };
    if (e < nowSeconds) return { ok: false, reason: "expired" };
  }
  return { ok: true, subscriberId: s };
}

/**
 * A short keyed hash, used for rate-limit keys so that raw IP addresses and
 * email addresses are never written to the database.
 */
export function hashKey(secret: string, value: string): string {
  return createHmac("sha256", secret)
    .update(`${DOMAIN}key:${value}`)
    .digest("hex")
    .slice(0, 32);
}
