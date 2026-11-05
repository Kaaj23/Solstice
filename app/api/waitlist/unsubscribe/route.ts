import { RATE_LIMITS } from "@/lib/waitlist/constants";
import {
  clientKey,
  isSameOrigin,
  json,
  readJson,
  readLimitedText,
} from "@/lib/waitlist/http";
import { getWaitlistRuntime } from "@/lib/waitlist/runtime";
import { logSafe, unsubscribe } from "@/lib/waitlist/service";
import { tokenBodySchema } from "@/lib/waitlist/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/waitlist/unsubscribe
 *
 * Two callers:
 *  1. The /waitlist/unsubscribe page: JSON `{ token, erase? }` from our own origin.
 *  2. A mail client's one-click unsubscribe (RFC 8058): the token is in the query
 *     string and the body is `List-Unsubscribe=One-Click`. There is no Origin
 *     header on these requests, so they are accepted only when they carry exactly
 *     that body, and they can only unsubscribe, never erase.
 *
 * Opening an unsubscribe link never changes anything by itself (GET is not
 * handled), so link pre-fetching cannot unsubscribe anyone.
 */
export async function POST(request: Request) {
  const waitlist = getWaitlistRuntime();
  if (!waitlist.available) return json({ ok: false, code: "unavailable" }, 503);

  const queryToken = new URL(request.url).searchParams.get("token");
  let token: string;
  let erase = false;

  if (queryToken) {
    const body = await readLimitedText(request);
    if (
      body === null ||
      new URLSearchParams(body).get("List-Unsubscribe") !== "One-Click"
    ) {
      return json({ ok: false, code: "invalid" }, 400);
    }
    token = queryToken;
  } else {
    if (!isSameOrigin(request)) return json({ ok: false, code: "forbidden" }, 403);
    const parsed = tokenBodySchema.safeParse(await readJson(request));
    if (!parsed.success) return json({ ok: false, code: "invalid" }, 400);
    token = parsed.data.token;
    erase = parsed.data.erase;
  }

  try {
    const limit = RATE_LIMITS.tokenActionPerIp;
    const hits = await waitlist.deps.store.hit(
      `token:ip:${clientKey(request, waitlist.deps.tokenSecret)}`,
      limit.windowSeconds,
      new Date()
    );
    if (hits > limit.max) {
      return json({ ok: false, code: "rate_limited" }, 429, {
        "Retry-After": String(limit.windowSeconds),
      });
    }

    const result = await unsubscribe(waitlist.deps, token, { erase });
    if (result.kind === "invalid") return json({ ok: false, code: "invalid" }, 400);
    return json({ ok: true, status: result.kind });
  } catch (error) {
    logSafe("unsubscribe failed", error);
    return json({ ok: false, code: "error" }, 500);
  }
}
