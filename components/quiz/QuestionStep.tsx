"use client";

import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import type { QuizQuestion } from "@/data/quiz";

interface QuestionStepProps {
  question: QuizQuestion;
  index: number;
  total: number;
  selected: string | null;
  onSelect: (optionId: string) => void;
  onBack: () => void;
  onNext: () => void;
}

const LETTERS = ["A", "B", "C", "D"] as const;

/**
 * One question per screen. Answers are native radio inputs, so Tab, the arrow
 * keys and Space work with no custom key handling, and Enter submits the form.
 * Choosing an answer never auto-advances — that would fire while a keyboard
 * user is simply arrowing through the options.
 */
export default function QuestionStep({
  question,
  index,
  total,
  selected,
  onSelect,
  onBack,
  onNext,
}: QuestionStepProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const headingId = `${question.id}-prompt`;
  const isLast = index === total - 1;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (selected) onNext();
      }}
      className="mx-auto w-full max-w-2xl"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#d4af37]">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} ·{" "}
        {question.topic}
      </p>
      <h2
        id={headingId}
        ref={headingRef}
        tabIndex={-1}
        className="mt-5 font-display text-[clamp(1.875rem,7vw,3.25rem)] leading-[1.08] tracking-tight focus:outline-none"
      >
        {question.prompt}
      </h2>

      <div role="radiogroup" aria-labelledby={headingId} className="mt-9 grid gap-3">
        {question.options.map((option, optionIndex) => (
          <label
            key={option.id}
            className="group flex min-h-[3.75rem] cursor-pointer items-center gap-5 border border-white/15 bg-[#101014]/80 px-5 py-4 transition-colors duration-300 hover:border-[#d4af37]/50 has-[:checked]:border-[#d4af37] has-[:checked]:bg-[#d4af37]/10 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#d4af37] md:px-7"
          >
            <input
              type="radio"
              name={question.id}
              value={option.id}
              checked={selected === option.id}
              onChange={() => onSelect(option.id)}
              className="sr-only"
            />
            <span aria-hidden="true" className="font-mono text-xs text-[#d4af37]">
              {LETTERS[optionIndex]}
            </span>
            <span className="flex-1 text-base text-white/85 group-has-[:checked]:text-white">
              {option.label}
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-3 shrink-0 rounded-full border border-white/30 transition-colors group-has-[:checked]:border-[#d4af37] group-has-[:checked]:bg-[#d4af37]"
            />
          </label>
        ))}
      </div>

      <div className="mt-9 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex min-h-12 items-center px-2 text-xs uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
        >
          ← Back
        </button>
        <button
          type="submit"
          disabled={!selected}
          className="inline-flex min-h-12 items-center border border-[#d4af37]/70 px-8 text-[11px] uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37] disabled:cursor-not-allowed disabled:border-white/15 disabled:text-white/30 disabled:hover:bg-transparent disabled:hover:text-white/30"
        >
          {isLast ? "See my light" : "Continue"}
        </button>
      </div>
    </form>
  );
}
