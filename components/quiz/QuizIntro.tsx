"use client";

import { useFocusOnMount } from "@/hooks/use-focus-on-mount";

interface QuizIntroProps {
  onBegin: () => void;
  /** Only true when returning to the intro, never on first page load. */
  focusHeading: boolean;
}

export default function QuizIntro({ onBegin, focusHeading }: QuizIntroProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>(focusHeading);

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="mb-8 text-[10px] uppercase tracking-[0.45em] text-[#e2c979] md:text-xs">
        A private consultation
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[clamp(2.75rem,12vw,6.5rem)] leading-[0.95] tracking-[-0.04em] focus:outline-none"
      >
        Find your <span className="italic text-[#d4af37]">light.</span>
      </h1>
      <p className="mx-auto mt-8 max-w-md text-sm leading-8 text-white/60 md:text-base">
        Five questions, no right answers. Respond by instinct and we will match you to the
        atmosphere that reflects your own.
      </p>
      <button
        type="button"
        onClick={onBegin}
        className="mt-11 inline-flex min-h-12 items-center border border-[#d4af37]/70 bg-black/30 px-10 py-4 text-[11px] uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
      >
        Begin the consultation
      </button>
      <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-white/40">
        Five questions · about a minute
      </p>
    </div>
  );
}
