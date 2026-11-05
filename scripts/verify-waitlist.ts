/**
 * Verifies the waitlist without any external service.
 *
 *   npm run verify:waitlist
 *
 * - Validation, signed tokens, the confirmation email and the Resend request
 *   shape are checked directly.
 * - The whole subscription lifecycle (sign-up, double opt-in, duplicates,
 *   resubscribe, unsubscribe, erasure, rate limits, a concurrent race) runs
 *   against TWO stores: the in-memory one, and the real Postgres store backed by
 *   an in-process Postgres (PGlite) with the actual migration applied.
 * - Database-level guarantees (unique email, normalised email, consent required,
 *   no access for Supabase's public roles, the retention function) are checked
 *   against that Postgres directly.
 *
 * It uses mocks for email, so it proves the logic and the SQL, not live delivery
 * or a live Supabase project. Those need real credentials (see docs/waitlist.md).
 */
import { readFileSync } from "node:fs";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";

import { fragrances } from "@/data/fragrances";
import {
  FRAGRANCE_PREFERENCES,
  MIN_FILL_MS,
  RATE_LIMITS,
  RESEND_COOLDOWN_SECONDS,
} from "@/lib/waitlist/constants";
import { createRecordingSender } from "@/lib/waitlist/email/outbox";
import { createResendSender, EmailDeliveryError } from "@/lib/waitlist/email/resend";
import { buildConfirmationEmail } from "@/lib/waitlist/email/templates";
import {
  buildLinks,
  confirm,
  signup,
  unsubscribe,
  type WaitlistDeps,
} from "@/lib/waitlist/service";
import { createMemoryStore } from "@/lib/waitlist/stores/memory";
import { createPostgresStore, type SqlExecutor } from "@/lib/waitlist/stores/postgres";
import { hashKey, signToken, verifyToken } from "@/lib/waitlist/tokens";
import type { WaitlistStore } from "@/lib/waitlist/types";
import {
  antiAbuseSchema,
  normalizeEmail,
  signupSchema,
  validateSignup,
} from "@/lib/waitlist/validation";

let failures = 0;
let checks = 0;
function check(condition: boolean, message: string): void {
  checks += 1;
  if (!condition) {
    failures += 1;
    if (failures <= 40) console.error(`FAIL  ${message}`);
  }
}

const SECRET = "test-secret-test-secret-test-secret-0123456789";
const BASE = "https://example.test";

async function main(): Promise<void> {
  /* ------------------------------------------------------- shared vocabulary */

  check(
    JSON.stringify([...FRAGRANCE_PREFERENCES].sort()) ===
      JSON.stringify(["all", ...fragrances.map((f) => f.slug)].sort()),
    "fragrance preferences must be 'all' plus every fragrance in data/fragrances.ts"
  );

  /* ------------------------------------------------------------- validation */

  const ok = (email: string, extra: Record<string, unknown> = {}) =>
    signupSchema.safeParse({ email, fragrance: "all", consent: true, ...extra });

  check(ok("name@example.com").success, "valid email accepted");
  check(
    ok("  Name@Example.COM  ").success &&
      (ok("  Name@Example.COM  ") as { data: { email: string } }).data.email ===
        "name@example.com",
    "email is trimmed and lower-cased"
  );
  check(
    normalizeEmail("ＡＢ@Example.com") === "ab@example.com",
    "email normalisation folds full-width characters"
  );
  for (const bad of [
    "",
    "   ",
    "plain",
    "a@b",
    "@example.com",
    "name@",
    "a b@example.com",
    `${"a".repeat(250)}@example.com`,
  ]) {
    check(!ok(bad).success, `invalid email rejected: "${bad.slice(0, 24)}"`);
  }
  check(
    !signupSchema.safeParse({ fragrance: "all", consent: true }).success,
    "missing email rejected"
  );
  check(
    !signupSchema.safeParse({ email: 123, fragrance: "all", consent: true }).success,
    "non-string email rejected"
  );
  check(
    !signupSchema.safeParse({ email: "a@example.com", fragrance: "all" }).success,
    "missing consent rejected"
  );
  check(!ok("a@example.com", { consent: false }).success, "consent=false rejected");
  check(
    !ok("a@example.com", { consent: "true" }).success,
    "consent as a string rejected"
  );
  check(
    !ok("a@example.com", { fragrance: "vetiver" }).success,
    "unknown fragrance rejected"
  );
  check(
    signupSchema.safeParse({ email: "a@example.com", consent: true }).success &&
      (
        signupSchema.parse({ email: "a@example.com", consent: true }) as {
          fragrance: string;
        }
      ).fragrance === "all",
    "fragrance defaults to all"
  );
  for (const slug of FRAGRANCE_PREFERENCES)
    check(
      ok("a@example.com", { fragrance: slug }).success,
      `fragrance '${slug}' accepted`
    );
  check(
    validateSignup({ email: "x", fragrance: "all", consent: false })?.consent !==
      undefined,
    "client validation reports the consent error"
  );
  check(
    validateSignup({ email: "x", fragrance: "all", consent: false })?.email !== undefined,
    "client validation reports the email error"
  );
  check(
    validateSignup({ email: "a@example.com", fragrance: "all", consent: true }) === null,
    "client validation passes valid input"
  );
  check(
    antiAbuseSchema.safeParse({ hp_website_url: "http://spam" }).success === false,
    "honeypot must stay empty"
  );
  check(
    antiAbuseSchema.safeParse({}).success,
    "honeypot is optional in the schema (the route also demands elapsedMs)"
  );
  check(MIN_FILL_MS > 0, "a minimum fill time is configured");

  /* ----------------------------------------------------------------- tokens */

  const ID = "123e4567-e89b-42d3-a456-426614174000";
  const now = Math.floor(Date.now() / 1000);
  const confirmToken = signToken(SECRET, "confirm", ID, now + 60);
  check(verifyToken(SECRET, confirmToken, "confirm", now).ok, "confirm token verifies");
  const wrongPurpose = verifyToken(SECRET, confirmToken, "unsub", now);
  check(!wrongPurpose.ok, "a confirm token cannot be used to unsubscribe");
  check(
    !verifyToken("another-secret-another-secret-123456789", confirmToken, "confirm", now)
      .ok,
    "token fails under a different secret"
  );
  const expired = verifyToken(SECRET, confirmToken, "confirm", now + 3600);
  check(!expired.ok && expired.reason === "expired", "expired token reports 'expired'");
  const [payloadPart, sigPart] = confirmToken.split(".") as [string, string];
  const forgedPayload = Buffer.from(
    JSON.stringify({
      p: "confirm",
      s: "00000000-0000-4000-8000-000000000000",
      e: now + 60,
    })
  ).toString("base64url");
  check(
    !verifyToken(SECRET, `${forgedPayload}.${sigPart}`, "confirm", now).ok,
    "tampered payload is rejected"
  );
  check(
    !verifyToken(SECRET, `${payloadPart}.${sigPart.slice(0, -2)}AA`, "confirm", now).ok,
    "tampered signature is rejected"
  );
  for (const junk of ["", "x", "a.b.c", "....", "!!!.???"])
    check(
      !verifyToken(SECRET, junk, "confirm", now).ok,
      `junk token rejected: "${junk}"`
    );
  const unsubToken = signToken(SECRET, "unsub", ID);
  check(
    verifyToken(SECRET, unsubToken, "unsub", now + 10 ** 9).ok,
    "unsubscribe token never expires"
  );
  check(
    !verifyToken(SECRET, signToken(SECRET, "unsub", "not-a-uuid"), "unsub", now).ok,
    "token for a non-uuid subject is rejected"
  );
  check(
    hashKey(SECRET, "ip:1.2.3.4") === hashKey(SECRET, "ip:1.2.3.4") &&
      hashKey(SECRET, "ip:1.2.3.4") !== hashKey(SECRET, "ip:1.2.3.5"),
    "hashKey is stable and distinguishes inputs"
  );
  check(
    !hashKey(SECRET, "ip:1.2.3.4").includes("1.2.3.4"),
    "hashKey does not contain the raw value"
  );

  /* ---------------------------------------------------------- email content */

  {
    const links = buildLinks(
      {
        store: createMemoryStore(),
        email: createRecordingSender(),
        tokenSecret: SECRET,
        baseUrl: BASE,
      },
      ID,
      now + 60
    );
    const message = buildConfirmationEmail({
      to: "a@example.com",
      fragrance: "aurora",
      ...links,
    });
    check(
      message.subject.length > 0 &&
        message.html.includes(links.confirmUrl) &&
        message.text.includes(links.confirmUrl),
      "confirmation email carries the confirm link (html and text)"
    );
    check(
      message.html.includes(links.unsubscribeUrl) &&
        message.text.includes(links.unsubscribeUrl),
      "confirmation email carries an unsubscribe link"
    );
    check(
      message.headers?.["List-Unsubscribe"] === `<${links.oneClickUnsubscribeUrl}>` &&
        message.headers?.["List-Unsubscribe-Post"] === "List-Unsubscribe=One-Click",
      "confirmation email has RFC 8058 one-click unsubscribe headers"
    );
    check(
      !/[$€£]\s?\d|\bdiscount\b|\bfree\b|\bsample\b|launch(es|ing)? (on|in)\b|priority/i.test(
        message.text
      ),
      "email makes no price, discount, sample or launch-date promises"
    );
    check(
      /not yet available to purchase/i.test(message.text),
      "email states the fragrances are not yet available"
    );
    const hostile = buildConfirmationEmail({
      to: "a@example.com",
      fragrance: "all",
      ...links,
      confirmUrl: 'https://x.test/?a="><script>alert(1)</script>',
    });
    check(!hostile.html.includes("<script>"), "email HTML escapes dynamic values");
  }

  /* --------------------------------------------------- Resend request shape */

  {
    const calls: { url: string; init: RequestInit }[] = [];
    const send = createResendSender({
      apiKey: "re_test_key",
      from: "SOLSTICE <hello@example.test>",
      fetchImpl: (async (url: string, init: RequestInit) => {
        calls.push({ url, init });
        return new Response("{}", { status: 200 });
      }) as unknown as typeof fetch,
    }).send;
    await send({
      to: "a@example.com",
      subject: "S",
      html: "<p>h</p>",
      text: "t",
      headers: { "List-Unsubscribe": "<x>" },
    });
    const call = calls[0];
    const body = call ? JSON.parse(String(call.init.body)) : {};
    check(
      call?.url === "https://api.resend.com/emails",
      "Resend: posts to the Resend API"
    );
    check(
      (call?.init.headers as Record<string, string>)?.Authorization ===
        "Bearer re_test_key",
      "Resend: sends the API key as a bearer token"
    );
    check(
      body.from === "SOLSTICE <hello@example.test>" &&
        body.to?.[0] === "a@example.com" &&
        body.headers?.["List-Unsubscribe"] === "<x>",
      "Resend: body has from, to and headers"
    );

    const failing = createResendSender({
      apiKey: "re_test_key",
      from: "x@example.test",
      fetchImpl: (async () =>
        new Response('{"error":"bad address a@example.com"}', {
          status: 422,
        })) as unknown as typeof fetch,
    });
    let thrown: unknown;
    try {
      await failing.send({ to: "a@example.com", subject: "S", html: "", text: "" });
    } catch (error) {
      thrown = error;
    }
    check(
      thrown instanceof EmailDeliveryError && thrown.status === 422,
      "Resend: a rejected message throws EmailDeliveryError"
    );
    check(
      !String((thrown as Error | undefined)?.message).includes("a@example.com") &&
        !String((thrown as Error | undefined)?.message).includes("re_test_key"),
      "Resend: the error never contains the recipient or the API key"
    );
  }

  /* --------------------------------------------------- lifecycle (any store) */

  interface Harness {
    name: string;
    store: WaitlistStore;
    /** Number of subscriber rows. */
    rows(): Promise<number>;
    /** Everything the audit log holds, as text. */
    auditText(): Promise<string>;
    auditTypes(): Promise<string[]>;
  }

  async function lifecycle(h: Harness) {
    const t = (label: string) => `[${h.name}] ${label}`;
    const email = createRecordingSender();
    let clock = new Date("2026-11-05T10:00:00.000Z");
    const deps: WaitlistDeps = {
      store: h.store,
      email,
      tokenSecret: SECRET,
      baseUrl: BASE,
      now: () => clock,
    };
    const advance = (seconds: number) =>
      (clock = new Date(clock.getTime() + seconds * 1000));
    const parse = (raw: Record<string, unknown>) =>
      signupSchema.parse({ fragrance: "all", consent: true, ...raw });
    const ip = (n: number) => hashKey(SECRET, `ip:10.0.0.${n}`);
    const tokenFrom = (message: string, route: "confirm" | "unsubscribe") =>
      new URL(
        message.match(
          new RegExp(`https://[^\\s"]*/waitlist/${route}\\?token=[^\\s"<]+`)
        )![0]
      ).searchParams.get("token")!;
    const lastMail = () => email.sent[email.sent.length - 1]!;

    // 1. First sign-up -> pending, one confirmation email, consent recorded.
    const first = await signup(
      deps,
      parse({ email: "Ada@Example.com ", fragrance: "aurora" }),
      { ipKey: ip(1) }
    );
    check(
      first.kind === "pending_confirmation",
      t("new sign-up is pending confirmation")
    );
    check(
      email.sent.length === 1 && email.sent[0]?.to === "ada@example.com",
      t("one confirmation email goes to the normalised address")
    );
    const row = await h.store.findByEmail("ada@example.com");
    check(row?.status === "pending", t("new subscriber is pending, not confirmed"));
    check(row?.confirmedAt === null, t("a pending subscriber has no confirmed_at"));
    check(row?.fragrancePreference === "aurora", t("fragrance preference stored"));
    check(
      row?.consentVersion.length === 10 &&
        row.consentAt.toISOString() === clock.toISOString(),
      t("consent version and timestamp stored")
    );
    check(
      row?.confirmationSentAt?.toISOString() === clock.toISOString(),
      t("confirmation_sent_at stored")
    );
    check(
      email.sent[0]!.html.includes("/waitlist/confirm?token=") &&
        email.sent[0]!.html.includes("/waitlist/unsubscribe?token="),
      t("email links point at the confirm and unsubscribe pages")
    );

    // 2. Re-submitting while pending inside the cool-down does not send another email.
    advance(30);
    const again = await signup(
      deps,
      parse({ email: "ada@example.com", fragrance: "eclipse" }),
      { ipKey: ip(1) }
    );
    check(
      again.kind === "pending_confirmation" && email.sent.length === 1,
      t("re-submit within the cool-down sends no second email")
    );
    check(
      (await h.store.findByEmail("ada@example.com"))?.fragrancePreference === "eclipse",
      t("re-submit updates the preference of a pending sign-up")
    );
    check((await h.rows()) === 1, t("still exactly one row for the address"));

    // 3. After the cool-down a fresh confirmation is sent.
    advance(RESEND_COOLDOWN_SECONDS + 1);
    await signup(deps, parse({ email: "ada@example.com", fragrance: "eclipse" }), {
      ipKey: ip(1),
    });
    check(email.sent.length === 2, t("a new confirmation is sent after the cool-down"));

    // 4. A bad / forged / wrong-purpose token never confirms.
    check(
      (await confirm(deps, "garbage")).kind === "invalid",
      t("garbage confirm token is invalid")
    );
    const unsubFromMail = tokenFrom(lastMail().html, "unsubscribe");
    check(
      (await confirm(deps, unsubFromMail)).kind === "invalid",
      t("an unsubscribe token cannot confirm")
    );
    check(
      (await h.store.findByEmail("ada@example.com"))?.status === "pending",
      t("still pending after invalid attempts")
    );

    // 5. Valid token -> confirmed; idempotent.
    const confirmFromMail = tokenFrom(lastMail().html, "confirm");
    const confirmed = await confirm(deps, confirmFromMail);
    check(
      confirmed.kind === "confirmed" && !confirmed.alreadyConfirmed,
      t("valid confirm token confirms")
    );
    const confirmedRow = await h.store.findByEmail("ada@example.com");
    check(
      confirmedRow?.status === "confirmed" &&
        confirmedRow.confirmedAt?.toISOString() === clock.toISOString(),
      t("status confirmed with timestamp")
    );
    const reconfirm = await confirm(deps, confirmFromMail);
    check(
      reconfirm.kind === "confirmed" && reconfirm.alreadyConfirmed,
      t("confirming twice is harmless")
    );

    // 6. Duplicate sign-up of a confirmed address. (An hour later: this would be the
    // 4th sign-up for ada@ inside one hour, which the per-email rate limit blocks.)
    advance(RATE_LIMITS.signupPerEmail.windowSeconds + 1);
    const dupe = await signup(deps, parse({ email: "ADA@example.com" }), {
      ipKey: ip(2),
    });
    check(
      dupe.kind === "already_subscribed",
      t("a confirmed address reports already_subscribed")
    );
    check(email.sent.length === 2, t("no email is sent for a confirmed duplicate"));
    check(
      (await h.rows()) === 1 &&
        (await h.store.findByEmail("ada@example.com"))?.status === "confirmed",
      t("duplicate leaves one confirmed row")
    );

    // 7. Expired confirmation link.
    const sleeper = await signup(deps, parse({ email: "grace@example.com" }), {
      ipKey: ip(3),
    });
    check(sleeper.kind === "pending_confirmation", t("second subscriber signs up"));
    const graceConfirm = tokenFrom(lastMail().html, "confirm");
    advance(8 * 24 * 3600);
    check(
      (await confirm(deps, graceConfirm)).kind === "expired",
      t("an expired confirm link reports expired")
    );
    check(
      (await h.store.findByEmail("grace@example.com"))?.status === "pending",
      t("expired link does not confirm")
    );

    // 8. Unsubscribe; an old confirm link must not re-subscribe.
    const adaUnsub = unsubFromMail;
    check(
      (await unsubscribe(deps, adaUnsub)).kind === "unsubscribed",
      t("unsubscribe succeeds")
    );
    const adaAfter = await h.store.findByEmail("ada@example.com");
    check(
      adaAfter?.status === "unsubscribed" && adaAfter.unsubscribedAt !== null,
      t("status unsubscribed with timestamp")
    );
    check(
      (await unsubscribe(deps, adaUnsub)).kind === "unsubscribed",
      t("unsubscribing twice is harmless")
    );
    // A perfectly valid (unexpired) confirm link for an address that has since opted
    // out must not quietly re-subscribe it.
    const liveConfirm = signToken(
      SECRET,
      "confirm",
      adaAfter!.id,
      Math.floor(clock.getTime() / 1000) + 3600
    );
    check(
      (await confirm(deps, liveConfirm)).kind === "invalid",
      t("a valid confirm link cannot re-subscribe an unsubscribed address")
    );
    check(
      (await confirm(deps, confirmFromMail)).kind === "expired",
      t("an old, expired confirm link reports expired")
    );
    check(
      (await h.store.findByEmail("ada@example.com"))?.status === "unsubscribed",
      t("still unsubscribed")
    );
    check(
      (await unsubscribe(deps, "nonsense")).kind === "invalid",
      t("invalid unsubscribe token is rejected")
    );

    // 9. Re-subscribing needs fresh consent and a fresh confirmation.
    const mailsBefore = email.sent.length;
    const back = await signup(
      deps,
      parse({ email: "ada@example.com", fragrance: "nocturne" }),
      { ipKey: ip(4) }
    );
    const adaBack = await h.store.findByEmail("ada@example.com");
    check(
      back.kind === "pending_confirmation" && adaBack?.status === "pending",
      t("an unsubscribed address returns to pending, not confirmed")
    );
    check(
      email.sent.length === mailsBefore + 1,
      t("resubscribe sends a new confirmation")
    );
    check(
      adaBack?.fragrancePreference === "nocturne" &&
        adaBack.unsubscribedAt === null &&
        adaBack.confirmedAt === null,
      t("resubscribe resets the old timestamps and updates the preference")
    );
    check((await h.rows()) === 2, t("resubscribing reuses the existing row"));

    // 10. Email provider failure: no false success, no confirmation, retry works.
    email.failNext();
    const failed = await signup(deps, parse({ email: "lin@example.com" }), {
      ipKey: ip(5),
    });
    check(
      failed.kind === "email_failed",
      t("a provider failure is reported as email_failed, never as success")
    );
    const lin = await h.store.findByEmail("lin@example.com");
    check(
      lin?.status === "pending" && lin.confirmationSentAt === null,
      t("failed send leaves a pending subscriber with no confirmation_sent_at")
    );
    const retry = await signup(deps, parse({ email: "lin@example.com" }), {
      ipKey: ip(5),
    });
    check(
      retry.kind === "pending_confirmation",
      t("retrying after a provider failure sends the email")
    );

    // 11. Erasure.
    const linUnsub = tokenFrom(lastMail().html, "unsubscribe");
    check(
      (await unsubscribe(deps, linUnsub, { erase: true })).kind === "erased",
      t("erase succeeds")
    );
    check(
      (await h.store.findByEmail("lin@example.com")) === null,
      t("erased subscriber is gone")
    );
    check(
      (await unsubscribe(deps, linUnsub, { erase: true })).kind === "erased",
      t("erasing twice is harmless")
    );
    check(
      (await unsubscribe(deps, linUnsub)).kind === "unsubscribed",
      t("unsubscribing an erased address is harmless")
    );
    const relin = await signup(deps, parse({ email: "lin@example.com" }), {
      ipKey: ip(5),
    });
    check(
      relin.kind === "pending_confirmation",
      t("an erased address can sign up again, as a brand-new pending record")
    );

    // 12. Concurrency: many identical sign-ups create exactly one row.
    const before = await h.rows();
    const results = await Promise.allSettled(
      Array.from({ length: 6 }, (_, i) =>
        signup(deps, parse({ email: "race@example.com" }), { ipKey: ip(20 + i) })
      )
    );
    check(
      results.every((r) => r.status === "fulfilled"),
      t("concurrent sign-ups all complete without error")
    );
    check(
      (await h.rows()) === before + 1,
      t("concurrent identical sign-ups create exactly one row")
    );

    // 13. Rate limits.
    const perEmail = RATE_LIMITS.signupPerEmail.max;
    const kinds: string[] = [];
    for (let i = 0; i < perEmail + 2; i += 1) {
      kinds.push(
        (
          await signup(deps, parse({ email: "limited@example.com" }), {
            ipKey: ip(40 + i),
          })
        ).kind
      );
    }
    check(
      kinds.slice(perEmail).every((k) => k === "rate_limited"),
      t("per-email rate limit blocks repeated sign-ups for one address")
    );
    const perIp = RATE_LIMITS.signupPerIp.max;
    const ipKinds: string[] = [];
    for (let i = 0; i < perIp + 2; i += 1) {
      ipKinds.push(
        (await signup(deps, parse({ email: `bulk${i}@example.com` }), { ipKey: ip(99) }))
          .kind
      );
    }
    check(
      ipKinds.slice(0, perIp).every((k) => k === "pending_confirmation") &&
        ipKinds.slice(perIp).every((k) => k === "rate_limited"),
      t("per-IP rate limit blocks the burst after the allowance")
    );
    advance(RATE_LIMITS.signupPerIp.windowSeconds + 1);
    check(
      (
        await signup(deps, parse({ email: "after-window@example.com" }), {
          ipKey: ip(99),
        })
      ).kind === "pending_confirmation",
      t("the rate limit resets after its window")
    );

    // 14. Audit trail.
    const types = await h.auditTypes();
    for (const expected of [
      "signup_requested",
      "confirmation_sent",
      "confirmation_failed",
      "confirmed",
      "duplicate_signup",
      "unsubscribed",
      "resubscribe_requested",
      "erased",
      "preference_updated",
    ]) {
      check(types.includes(expected), t(`audit log contains '${expected}'`));
    }
    const audit = await h.auditText();
    check(
      !audit.includes("@") && !/example\.com/.test(audit),
      t("the audit log holds no email addresses")
    );
  }

  const memory = createMemoryStore();
  await lifecycle({
    name: "memory",
    store: memory,
    rows: async () => memory.all().length,
    auditText: async () => JSON.stringify(memory.events),
    auditTypes: async () => memory.events.map((e) => e.type),
  });

  /* --------------------------------------------- the same suite on Postgres */

  const migration = readFileSync(
    path.join(process.cwd(), "supabase/migrations/20261105000000_waitlist.sql"),
    "utf8"
  );

  async function freshDatabase() {
    const db = new PGlite();
    // Supabase ships these roles; recreate them so the lock-down can be tested.
    await db.exec("create role anon nologin; create role authenticated nologin;");
    await db.exec(migration);
    const sql: SqlExecutor = {
      query: async (text, params) =>
        (await db.query(text, params)).rows as Record<string, unknown>[],
    };
    return { db, sql };
  }

  {
    const { db, sql } = await freshDatabase();
    const store = createPostgresStore(sql);
    await lifecycle({
      name: "postgres",
      store,
      rows: async () =>
        Number(
          (
            (await db.query("select count(*)::int as n from public.waitlist_subscribers"))
              .rows[0] as { n: number }
          ).n
        ),
      auditText: async () =>
        JSON.stringify((await db.query("select * from public.waitlist_events")).rows),
      auditTypes: async () =>
        (await db.query("select event_type from public.waitlist_events")).rows.map(
          (r) => (r as { event_type: string }).event_type
        ),
    });
    await db.close();
  }

  /* --------------------------------------- database-level guarantees (PGlite) */

  {
    const { db } = await freshDatabase();
    const insert = (email: string, extra: Partial<Record<string, string>> = {}) =>
      db.query(
        `insert into public.waitlist_subscribers (email, fragrance_preference, status, consent_marketing, consent_version, consent_at, confirmed_at, unsubscribed_at)
       values ($1, $2, $3, $4, 'v', now(), $5::timestamptz, $6::timestamptz)`,
        [
          email,
          extra.pref ?? "all",
          extra.status ?? "pending",
          extra.consent ?? "true",
          extra.confirmedAt ?? null,
          extra.unsubAt ?? null,
        ]
      );
    const rejects = async (run: () => Promise<unknown>, code?: string) => {
      try {
        await run();
        return false;
      } catch (error) {
        return code ? (error as { code?: string }).code === code : true;
      }
    };

    await insert("one@example.com");
    check(
      await rejects(() => insert("one@example.com"), "23505"),
      "db: duplicate email is rejected by the unique index"
    );
    check(
      await rejects(() => insert("Upper@example.com"), "23514"),
      "db: a non-normalised (upper-case) email is rejected"
    );
    check(
      await rejects(() => insert(" spaced@example.com "), "23514"),
      "db: an email with surrounding spaces is rejected"
    );
    check(
      await rejects(() => insert("x@example.com", { consent: "false" }), "23514"),
      "db: consent_marketing=false is rejected"
    );
    check(
      await rejects(() => insert("y@example.com", { pref: "vetiver" }), "23514"),
      "db: an unknown fragrance preference is rejected"
    );
    check(
      await rejects(() => insert("z@example.com", { status: "active" }), "23514"),
      "db: an unknown status is rejected"
    );
    check(
      await rejects(() => insert("c@example.com", { status: "confirmed" }), "23514"),
      "db: 'confirmed' without confirmed_at is rejected"
    );
    check(
      await rejects(() => insert("u@example.com", { status: "unsubscribed" }), "23514"),
      "db: 'unsubscribed' without unsubscribed_at is rejected"
    );
    check(
      await rejects(
        () =>
          db.query(`insert into public.waitlist_events (event_type) values ('made_up')`),
        "23514"
      ),
      "db: an unknown event type is rejected"
    );

    for (const role of ["anon", "authenticated"]) {
      for (const table of [
        "waitlist_subscribers",
        "waitlist_events",
        "waitlist_rate_limits",
      ]) {
        await db.exec(`set role ${role}`);
        const denied = await rejects(
          () => db.query(`select * from public.${table}`),
          "42501"
        );
        await db.exec("reset role");
        check(
          denied,
          `db: role '${role}' cannot read ${table} (public API is locked out)`
        );
      }
    }
    const rls = (
      await db.query(
        `select relname, relrowsecurity from pg_class where relname in ('waitlist_subscribers','waitlist_events','waitlist_rate_limits')`
      )
    ).rows as { relrowsecurity: boolean }[];
    check(
      rls.length === 3 && rls.every((r) => r.relrowsecurity),
      "db: row level security is enabled on all three tables"
    );
    const policies = (
      await db.query(
        `select count(*)::int as n from pg_policies where schemaname = 'public' and tablename like 'waitlist_%'`
      )
    ).rows[0] as { n: number };
    check(
      policies.n === 0,
      "db: no RLS policies exist (nothing is exposed to non-privileged roles)"
    );

    // updated_at trigger
    const before = (
      await db.query(
        `select updated_at from public.waitlist_subscribers where email = 'one@example.com'`
      )
    ).rows[0] as { updated_at: Date };
    await new Promise((r) => setTimeout(r, 15));
    await db.query(
      `update public.waitlist_subscribers set fragrance_preference = 'corona' where email = 'one@example.com'`
    );
    const after = (
      await db.query(
        `select updated_at from public.waitlist_subscribers where email = 'one@example.com'`
      )
    ).rows[0] as { updated_at: Date };
    check(
      after.updated_at.getTime() > before.updated_at.getTime(),
      "db: updated_at is maintained by trigger"
    );

    // Retention: unconfirmed sign-ups older than 30 days are purged; others stay.
    await db.query(`insert into public.waitlist_subscribers (email, status, consent_marketing, consent_version, consent_at, created_at)
                  values ('stale@example.com','pending',true,'v',now() - interval '40 days', now() - interval '40 days'),
                         ('fresh@example.com','pending',true,'v',now(), now())`);
    await db.query(`insert into public.waitlist_subscribers (email, status, consent_marketing, consent_version, consent_at, created_at, confirmed_at)
                  values ('old-confirmed@example.com','confirmed',true,'v',now() - interval '400 days', now() - interval '400 days', now() - interval '399 days')`);
    await db.query(
      `insert into public.waitlist_rate_limits (key, window_start, hits) values ('old', now() - interval '3 days', 3), ('new', now(), 1)`
    );
    const purged = (await db.query(`select public.waitlist_purge_stale() as n`))
      .rows[0] as { n: number };
    const left = (
      await db.query(`select email from public.waitlist_subscribers order by email`)
    ).rows.map((r) => (r as { email: string }).email);
    check(
      purged.n === 1 && !left.includes("stale@example.com"),
      "db: purge removes the stale unconfirmed sign-up"
    );
    check(
      left.includes("fresh@example.com") &&
        left.includes("old-confirmed@example.com") &&
        left.includes("one@example.com"),
      "db: purge keeps fresh pending and confirmed subscribers"
    );
    const limitKeys = (
      await db.query(`select key from public.waitlist_rate_limits`)
    ).rows.map((r) => (r as { key: string }).key);
    check(
      !limitKeys.includes("old") && limitKeys.includes("new"),
      "db: purge clears expired rate-limit counters"
    );
    const purgeEvent = (
      await db.query(
        `select count(*)::int as n from public.waitlist_events where event_type = 'purged'`
      )
    ).rows[0] as { n: number };
    check(purgeEvent.n === 1, "db: purge writes an audit event");
    const migrationAgain = await rejects(() => db.exec(migration)).then(
      (rejected) => !rejected
    );
    check(migrationAgain, "db: the migration is idempotent (safe to run twice)");
    await db.close();
  }
}

main()
  .then(() => {
    /* ------------------------------------------------------------------ report */

    console.log(`Checks run:     ${checks}`);
    console.log(`Checks failed:  ${failures}`);
    if (failures > 0) {
      console.error(`\n${failures} check(s) failed.`);
      process.exit(1);
    }
    console.log("\nAll checks passed.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
