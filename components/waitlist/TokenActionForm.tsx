"use client";

import { forwardRef, useEffect, useRef, useState } from "react";
import Link from "next/link";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]";

type Mode = "confirm" | "unsubscribe";

type Result =
  | {
      kind: "success";
      detail: "confirmed" | "already_confirmed" | "unsubscribed" | "erased";
    }
  | { kind: "invalid" }
  | { kind: "failure"; message: string };

interface TokenActionFormProps {
  mode: Mode;
  token: string;
}

/**
 * The button behind the emailed confirm / unsubscribe links. The action only
 * happens when the person presses the button, never when the link is opened, so
 * email scanners that pre-fetch links cannot confirm or unsubscribe anyone.
 */
export default function TokenActionForm({ mode, token }: TokenActionFormProps) {
  const [erase, setErase] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) resultRef.current?.focus();
  }, [result]);

  async function run() {
    if (busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/waitlist/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "unsubscribe" ? { token, erase } : { token }),
        signal: AbortSignal.timeout(15_000),
      });
      const data = (await response.json().catch(() => null)) as {
        ok?: boolean;
        status?: string;
        alreadyConfirmed?: boolean;
        code?: string;
      } | null;

      if (response.ok && data?.ok) {
        if (mode === "confirm") {
          setResult({
            kind: "success",
            detail: data.alreadyConfirmed ? "already_confirmed" : "confirmed",
          });
        } else {
          setResult({
            kind: "success",
            detail: data.status === "erased" ? "erased" : "unsubscribed",
          });
        }
      } else if (data?.code === "invalid" || data?.code === "expired") {
        setResult({ kind: "invalid" });
      } else if (data?.code === "rate_limited") {
        setResult({
          kind: "failure",
          message: "Too many attempts. Please try again in a little while.",
        });
      } else if (data?.code === "unavailable") {
        setResult({
          kind: "failure",
          message: "This isn't available right now. Please try again later.",
        });
      } else {
        setResult({
          kind: "failure",
          message: "Something went wrong on our side. Please try again in a few minutes.",
        });
      }
    } catch {
      setResult({
        kind: "failure",
        message:
          "We couldn't reach the server. Please check your connection and try again.",
      });
    } finally {
      setBusy(false);
    }
  }

  if (result?.kind === "success") {
    const copy = {
      confirmed: {
        title: "You're confirmed.",
        body: "Thank you. You'll now receive SOLSTICE fragrance development updates and launch announcements. You can unsubscribe at any time from any email we send.",
      },
      already_confirmed: {
        title: "You're already confirmed.",
        body: "Your subscription is active. There's nothing more to do.",
      },
      unsubscribed: {
        title: "You've been unsubscribed.",
        body: "You won't receive further SOLSTICE emails. You're welcome to rejoin from the waitlist page whenever you like.",
      },
      erased: {
        title: "Your data has been deleted.",
        body: "We've permanently deleted your subscription record. You won't receive further SOLSTICE emails.",
      },
    }[result.detail];

    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role="status"
        className="border border-[#d4af37]/40 bg-[#0b0b0e] p-8 outline-none md:p-10"
      >
        <p className="font-display text-3xl md:text-4xl">{copy.title}</p>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/70">{copy.body}</p>
        <Link
          href="/"
          className={`mt-8 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#e2c979] hover:text-white ${focusRing}`}
        >
          Return to SOLSTICE →
        </Link>
      </div>
    );
  }

  if (result?.kind === "invalid") {
    return <InvalidLink ref={resultRef} />;
  }

  return (
    <div className="border border-white/15 bg-[#0b0b0e] p-8 md:p-10">
      {mode === "unsubscribe" && (
        <label className="flex cursor-pointer items-start gap-3 text-sm leading-6 text-white/75">
          <input
            type="checkbox"
            checked={erase}
            onChange={(event) => setErase(event.target.checked)}
            className={`mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[#d4af37] ${focusRing}`}
          />
          <span>
            Also permanently delete my data.
            <span className="mt-1 block text-xs text-white/50">
              Otherwise we keep your address, marked as unsubscribed, only so we can
              honour your choice.
            </span>
          </span>
        </label>
      )}

      {result?.kind === "failure" && (
        <p
          role="alert"
          className="mt-6 border border-[#ff8a7a]/50 bg-[#ff8a7a]/10 px-4 py-3 text-sm text-[#ffb3a8]"
        >
          {result.message}
        </p>
      )}

      <button
        type="button"
        onClick={run}
        disabled={busy}
        aria-busy={busy}
        className={`${mode === "unsubscribe" ? "mt-8" : "mt-0"} inline-flex min-h-12 w-full items-center justify-center border border-[#d4af37]/70 px-9 text-xs uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black disabled:cursor-wait disabled:opacity-60 sm:w-auto ${focusRing}`}
      >
        {busy
          ? "One moment…"
          : mode === "confirm"
            ? "Confirm my subscription"
            : "Unsubscribe"}
      </button>
    </div>
  );
}

export const InvalidLink = forwardRef<HTMLDivElement>(function InvalidLink(_props, ref) {
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      className="border border-white/15 bg-[#0b0b0e] p-8 outline-none md:p-10"
    >
      <p className="font-display text-3xl md:text-4xl">This link can&apos;t be used.</p>
      <p className="mt-4 max-w-md text-sm leading-7 text-white/70">
        It may have expired, been used already, or been copied incompletely. You can
        request a fresh confirmation email by joining the waitlist again.
      </p>
      <Link
        href="/waitlist"
        className={`mt-8 inline-flex min-h-12 items-center border border-[#d4af37]/70 px-9 text-xs uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black ${focusRing}`}
      >
        Join the waitlist
      </Link>
    </div>
  );
});
