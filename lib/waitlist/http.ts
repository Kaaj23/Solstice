import "server-only";

import { REQUEST_BODY_MAX_BYTES } from "./constants";
import { hashKey } from "./tokens";

/** Small helpers shared by the waitlist API routes. */

export function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

/**
 * Browsers send an Origin header on cross-site and same-site POSTs. Requests
 * from another site are refused; so are POSTs that carry neither Origin nor a
 * same-origin Fetch Metadata header (i.e. not from our own pages).
 */
export function isSameOrigin(request: Request): boolean {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  return request.headers.get("sec-fetch-site") === "same-origin";
}

/** Read a capped text body. `null` means too large. */
export async function readLimitedText(request: Request): Promise<string | null> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > REQUEST_BODY_MAX_BYTES) return null;
  const text = await request.text();
  return Buffer.byteLength(text, "utf8") > REQUEST_BODY_MAX_BYTES ? null : text;
}

export async function readJson(request: Request): Promise<unknown | undefined> {
  const text = await readLimitedText(request);
  if (text === null) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

/**
 * A keyed hash of the caller's address. On Vercel, x-forwarded-for is set by the
 * platform; the raw address is never stored or logged.
 */
export function clientKey(request: Request, secret: string): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return hashKey(secret, `ip:${ip}`);
}
