import { RATE_LIMITS } from "@/lib/waitlist/constants";
import { clientKey, isSameOrigin, json, readJson } from "@/lib/waitlist/http";
import { getWaitlistRuntime } from "@/lib/waitlist/runtime";
import { confirm, logSafe } from "@/lib/waitlist/service";
import { tokenBodySchema } from "@/lib/waitlist/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/waitlist/confirm: complete the double opt-in.
 *
 * This is a POST, triggered by a button on /waitlist/confirm, rather than an
 * action on opening the emailed link, so mail scanners that pre-fetch links
 * cannot confirm anyone on their behalf.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ ok: false, code: "forbidden" }, 403);

  const waitlist = getWaitlistRuntime();
  if (!waitlist.available) return json({ ok: false, code: "unavailable" }, 503);

  const parsed = tokenBodySchema.safeParse(await readJson(request));
  if (!parsed.success) return json({ ok: false, code: "invalid" }, 400);

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

    const result = await confirm(waitlist.deps, parsed.data.token);
    if (result.kind === "confirmed") {
      return json({
        ok: true,
        status: "confirmed",
        alreadyConfirmed: result.alreadyConfirmed,
      });
    }
    return json({ ok: false, code: result.kind }, 400);
  } catch (error) {
    logSafe("confirm failed", error);
    return json({ ok: false, code: "error" }, 500);
  }
}
