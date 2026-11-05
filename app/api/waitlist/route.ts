import { MIN_FILL_MS } from "@/lib/waitlist/constants";
import { clientKey, isSameOrigin, json, readJson } from "@/lib/waitlist/http";
import { getWaitlistRuntime } from "@/lib/waitlist/runtime";
import { logSafe, signup } from "@/lib/waitlist/service";
import { antiAbuseSchema, signupSchema, toFieldErrors } from "@/lib/waitlist/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/waitlist: start a sign-up (double opt-in).
 *
 * Public responses are deliberately generic: `code` tells the form which state
 * to show, and nothing about the database, the email provider or the
 * configuration is ever included.
 */
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ ok: false, code: "forbidden" }, 403);

  const waitlist = getWaitlistRuntime();
  if (!waitlist.available) return json({ ok: false, code: "unavailable" }, 503);

  const raw = await readJson(request);
  if (typeof raw !== "object" || raw === null)
    return json({ ok: false, code: "error" }, 400);

  // Anti-abuse: the honeypot must be empty and a person needs a moment to fill the form in.
  const abuse = antiAbuseSchema.safeParse(raw);
  if (!abuse.success || abuse.data.hp_website_url !== "") {
    return json({ ok: false, code: "error" }, 400);
  }
  if (abuse.data.elapsedMs === undefined || abuse.data.elapsedMs < MIN_FILL_MS) {
    return json({ ok: false, code: "error" }, 400);
  }

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return json(
      { ok: false, code: "validation", fieldErrors: toFieldErrors(parsed.error) },
      400
    );
  }

  try {
    const result = await signup(waitlist.deps, parsed.data, {
      ipKey: clientKey(request, waitlist.deps.tokenSecret),
    });

    switch (result.kind) {
      case "pending_confirmation":
        return json({ ok: true, status: "pending_confirmation" });
      case "already_subscribed":
        return json({ ok: true, status: "already_subscribed" });
      case "rate_limited":
        return json({ ok: false, code: "rate_limited" }, 429, {
          "Retry-After": String(result.retryAfterSeconds),
        });
      case "email_failed":
        return json({ ok: false, code: "email_failed" }, 502);
    }
  } catch (error) {
    logSafe("sign-up failed", error);
    return json({ ok: false, code: "error" }, 500);
  }
}
