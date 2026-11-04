"use client";

import { cn } from "@/lib/utils";

interface QuizProgressProps {
  topics: readonly string[];
  /** Index of the question currently shown. */
  current: number;
  /** Highest question index the person may jump to (all earlier ones are answered). */
  reachable: number;
  onSelect: (index: number) => void;
}

/**
 * Interactive progress indicator: one segment per question. Answered
 * questions can be revisited; questions not yet reached are disabled.
 */
export default function QuizProgress({
  topics,
  current,
  reachable,
  onSelect,
}: QuizProgressProps) {
  return (
    <nav aria-label="Consultation progress">
      <ol className="flex gap-2">
        {topics.map((topic, index) => {
          const isCurrent = index === current;
          const isReachable = index <= reachable;

          return (
            <li key={topic} className="flex-1">
              <button
                type="button"
                disabled={!isReachable}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Question ${index + 1} of ${topics.length}: ${topic}`}
                onClick={() => onSelect(index)}
                className="group flex h-11 w-full items-end pb-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] disabled:cursor-default"
              >
                <span
                  className={cn(
                    "block h-[2px] w-full transition-colors duration-500",
                    isCurrent
                      ? "bg-[#d4af37]"
                      : isReachable
                        ? "bg-[#d4af37]/45 group-hover:bg-[#d4af37]/80"
                        : "bg-white/15"
                  )}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
