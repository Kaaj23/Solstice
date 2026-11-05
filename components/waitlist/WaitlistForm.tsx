"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

import {
  CONSENT_LABEL,
  FRAGRANCE_PREFERENCES,
  type FragrancePreference,
} from "@/lib/waitlist/constants";
import { validateSignup, type FieldErrors } from "@/lib/waitlist/validation";

const LABELS: Record<FragrancePreference, string> = {
  all: "All fragrances",
  aurora: "Aurora",
  eclipse: "Eclipse",
  corona: "Corona",
  nocturne: "Nocturne",
};

type Availability = "checking" | "available" | "unavailable";
type Outcome =
  | { kind: "pending_confirmation"; email: string }
  | { kind: "already_subscribed"; email: string };

const FAILURE_MESSAGES: Record<string, string> = {
  rate_limited: "Too many attempts. Please wait a little while before trying again.",
  email_failed:
    "We couldn't send your confirmation email just now. Please try again in a few minutes.",
  network: "We couldn't reach the server. Please check your connection and try again.",
  forbidden: "This request could not be completed. Please reload the page and try again.",
  error: "Something went wrong on our side. Please try again in a few minutes.",
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]";

export function WaitlistUnavailable() {
  return (
    <div role="status" className="border border-white/15 bg-[#0b0b0e] p-8 md:p-10">
      <p className="font-display text-3xl">The waitlist isn&apos;t open yet.</p>
      <p className="mt-4 max-w-md text-sm leading-7 text-white/65">
        We&apos;re not accepting sign-ups at the moment, and nothing you type here would
        be saved. Please check back soon.
      </p>
    </div>
  );
}

interface WaitlistFormProps {
  /** Pre-selects the fragrance preference (e.g. on a fragrance page). */
  defaultFragrance?: FragrancePreference;
  /**
   * Whether the waitlist is accepting sign-ups. Pass it from a dynamic server
   * page when known; otherwise the form asks /api/waitlist/status on mount.
   */
  available?: boolean;
}

export default function WaitlistForm({
  defaultFragrance = "all",
  available,
}: WaitlistFormProps) {
  const uid = useId();
  const ids = {
    email: `${uid}-email`,
    emailError: `${uid}-email-error`,
    emailHint: `${uid}-email-hint`,
    consent: `${uid}-consent`,
    consentError: `${uid}-consent-error`,
    fragrance: `${uid}-fragrance`,
    formError: `${uid}-form-error`,
  };

  const [availability, setAvailability] = useState<Availability>(
    available === undefined ? "checking" : available ? "available" : "unavailable"
  );
  const [email, setEmail] = useState("");
  const [fragrance, setFragrance] = useState<FragrancePreference>(defaultFragrance);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const consentRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = performance.now();
  }, []);

  // Pages that cannot know at build time whether the waitlist is configured ask once.
  useEffect(() => {
    if (available !== undefined) return;
    const controller = new AbortController();
    fetch("/api/waitlist/status", { signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : { available: false }))
      .then((data: { available?: boolean }) =>
        setAvailability(data.available ? "available" : "unavailable")
      )
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError")
          setAvailability("unavailable");
      });
    return () => controller.abort();
  }, [available]);

  // Move focus to the result so screen-reader users hear it.
  useEffect(() => {
    if (outcome) resultRef.current?.focus();
  }, [outcome]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setFormError(null);

    const found = validateSignup({ email, fragrance, consent });
    if (found) {
      setErrors(found);
      if (found.email) emailRef.current?.focus();
      else if (found.consent) consentRef.current?.focus();
      return;
    }
    setErrors({});

    const form = event.currentTarget;
    const honeypot =
      (form.elements.namedItem("hp_website_url") as HTMLInputElement | null)?.value ?? "";

    setSubmitting(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          fragrance,
          consent,
          hp_website_url: honeypot,
          elapsedMs: Math.round(performance.now() - startedAt.current),
        }),
        signal: AbortSignal.timeout(15_000),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        status?: "pending_confirmation" | "already_subscribed";
        code?: string;
        fieldErrors?: FieldErrors;
      } | null;

      if (response.ok && data?.ok && data.status) {
        setOutcome({ kind: data.status, email: email.trim() });
      } else if (data?.code === "unavailable") {
        setAvailability("unavailable");
      } else if (data?.code === "validation" && data.fieldErrors) {
        setErrors(data.fieldErrors);
        (data.fieldErrors.email ? emailRef : consentRef).current?.focus();
      } else {
        setFormError(FAILURE_MESSAGES[data?.code ?? "error"] ?? FAILURE_MESSAGES.error!);
      }
    } catch {
      setFormError(FAILURE_MESSAGES.network!);
    } finally {
      setSubmitting(false);
    }
  }

  if (availability === "unavailable") return <WaitlistUnavailable />;

  if (outcome) {
    const pending = outcome.kind === "pending_confirmation";
    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role="status"
        className="border border-[#d4af37]/40 bg-[#0b0b0e] p-8 outline-none md:p-10"
      >
        <p className="font-display text-3xl md:text-4xl">
          {pending ? "Check your inbox." : "You're already on the list."}
        </p>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
          {pending ? (
            <>
              We&apos;ve sent a confirmation email to{" "}
              <span className="break-all text-white">{outcome.email}</span>. Follow the
              link inside to finish joining. You won&apos;t be subscribed until you do.
            </>
          ) : (
            <>
              <span className="break-all text-white">{outcome.email}</span> is already
              confirmed for SOLSTICE updates. There&apos;s nothing more to do.
            </>
          )}
        </p>
        {pending && (
          <p className="mt-4 max-w-md text-xs leading-6 text-white/50">
            Nothing in your inbox after a few minutes? Check your spam folder, or submit
            the form again.
          </p>
        )}
      </div>
    );
  }

  const checking = availability === "checking";

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-busy={submitting || checking}
      className="relative border border-white/15 bg-[#0b0b0e] p-6 md:p-10"
    >
      {/* Honeypot: invisible and unreachable for people; naive bots fill it in. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Leave this field empty
          <input
            type="text"
            name="hp_website_url"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <div>
        <label
          htmlFor={ids.email}
          className="block text-xs uppercase tracking-[0.22em] text-[#e2c979]"
        >
          Email address
        </label>
        <input
          ref={emailRef}
          id={ids.email}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${ids.emailError}` : ids.emailHint}
          placeholder="name@example.com"
          className={`mt-3 min-h-12 w-full border bg-black/40 px-4 text-base text-[#f5f0e8] placeholder:text-white/35 ${
            errors.email ? "border-[#ff8a7a]" : "border-white/25 focus:border-[#d4af37]"
          } ${focusRing}`}
        />
        {errors.email ? (
          <p id={ids.emailError} className="mt-2 text-sm text-[#ff9d8f]">
            {errors.email}
          </p>
        ) : (
          <p id={ids.emailHint} className="mt-2 text-xs text-white/45">
            We&apos;ll email you a link to confirm.
          </p>
        )}
      </div>

      <fieldset className="mt-8">
        <legend className="text-xs uppercase tracking-[0.22em] text-[#e2c979]">
          Most curious about{" "}
          <span className="normal-case tracking-normal text-white/45">(optional)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {FRAGRANCE_PREFERENCES.map((option) => (
            <label
              key={option}
              className="relative inline-flex min-h-11 cursor-pointer items-center border border-white/20 px-4 text-xs uppercase tracking-[0.18em] text-white/75 transition-colors hover:border-white/45 has-[:checked]:border-[#d4af37] has-[:checked]:bg-[#d4af37]/10 has-[:checked]:text-[#f0dfae] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#d4af37]"
            >
              <input
                type="radio"
                name={ids.fragrance}
                value={option}
                checked={fragrance === option}
                onChange={() => setFragrance(option)}
                className="sr-only"
              />
              {LABELS[option]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-8">
        <div className="flex items-start gap-3">
          <input
            ref={consentRef}
            id={ids.consent}
            name="consent"
            type="checkbox"
            required
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? ids.consentError : undefined}
            className={`mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[#d4af37] ${focusRing}`}
          />
          <label
            htmlFor={ids.consent}
            className="cursor-pointer text-sm leading-6 text-white/75"
          >
            {CONSENT_LABEL}{" "}
            <Link
              href="/privacy"
              className={`text-[#e2c979] underline underline-offset-4 hover:text-white ${focusRing}`}
            >
              Privacy notice
            </Link>
          </label>
        </div>
        {errors.consent && (
          <p id={ids.consentError} className="mt-2 text-sm text-[#ff9d8f]">
            {errors.consent}
          </p>
        )}
      </div>

      {formError && (
        <p
          id={ids.formError}
          role="alert"
          className="mt-8 border border-[#ff8a7a]/50 bg-[#ff8a7a]/10 px-4 py-3 text-sm text-[#ffb3a8]"
        >
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || checking}
        className={`mt-8 inline-flex min-h-12 w-full items-center justify-center border border-[#d4af37]/70 px-9 text-xs uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black disabled:cursor-wait disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-[#e9d6a0] sm:w-auto ${focusRing}`}
      >
        {submitting ? "Joining…" : "Join the waitlist"}
      </button>
    </form>
  );
}
