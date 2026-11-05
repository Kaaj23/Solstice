import { json } from "@/lib/waitlist/http";
import { getWaitlistRuntime } from "@/lib/waitlist/runtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/waitlist/status: whether the waitlist can accept sign-ups right now.
 *
 * It exists because most pages that embed the form are statically generated and
 * cannot know at build time whether the owner has configured the waitlist. The
 * answer is a single boolean; which settings are missing is never disclosed.
 */
export async function GET() {
  return json({ available: getWaitlistRuntime().available });
}
