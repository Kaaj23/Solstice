"use client";

import Image from "next/image";
import Link from "next/link";

import { getFragrance } from "@/data/fragrances";
import { quizQuestions } from "@/data/quiz";
import { useFocusOnMount } from "@/hooks/use-focus-on-mount";
import { buildExplanation } from "@/lib/quiz/explanation";
import type { QuizResult } from "@/lib/quiz/scoring";

interface QuizResultViewProps {
  result: QuizResult;
  onRestart: () => void;
}

export default function QuizResultView({ result, onRestart }: QuizResultViewProps) {
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const fragrance = getFragrance(result.primary);
  const secondary = result.secondary ? getFragrance(result.secondary) : null;
  const paragraphs = buildExplanation(result);
  const total = quizQuestions.length;

  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div
        className={`relative aspect-[4/3] overflow-hidden border border-white/10 bg-gradient-to-br ${fragrance.palette} bg-[#101014]`}
      >
        <Image
          src={fragrance.image}
          alt={`SOLSTICE ${fragrance.name} bottle and packaging concept`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#d4af37] md:text-xs">
          Your light · No. {fragrance.number}
        </p>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-display text-[clamp(2.75rem,13vw,6rem)] leading-none tracking-tight focus:outline-none"
        >
          {fragrance.name}
        </h2>
        <p className="mt-4 font-display text-xl italic text-[#e2c979] md:text-3xl">
          {fragrance.subtitle}
        </p>

        <div className="mt-7 space-y-4 text-sm leading-8 text-white/70 md:text-base">
          {paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 border-t border-white/15 pt-6">
          <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-white/45">
            The olfactory palette
          </p>
          <ul className="flex flex-wrap gap-2">
            {fragrance.notes.map((note) => (
              <li
                key={note}
                className="border border-white/15 px-4 py-2.5 text-xs text-white/80"
              >
                {note}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={`/fragrances/${fragrance.slug}`}
            className="inline-flex min-h-12 items-center justify-center border border-[#d4af37]/70 px-8 text-[11px] uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
          >
            Explore {fragrance.name}
          </Link>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-12 items-center justify-center px-6 text-[11px] uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
          >
            Restart the consultation
          </button>
        </div>

        {secondary && (
          <Link
            href={`/fragrances/${secondary.slug}`}
            className="group mt-9 flex items-center gap-5 border border-white/10 bg-[#101014]/80 p-4 transition-colors hover:border-[#d4af37]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
          >
            <div className="relative h-16 w-24 shrink-0 overflow-hidden bg-[#121216]">
              <Image
                src={secondary.image}
                alt=""
                fill
                sizes="96px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37]">
                Also worth exploring
              </p>
              <p className="mt-1 font-display text-2xl">{secondary.name}</p>
              <p className="text-xs text-white/50">
                {result.scores[secondary.slug]} of your {total} answers pointed here
              </p>
            </div>
          </Link>
        )}

        <div className="mt-9 border-t border-white/10 pt-6">
          <p className="mb-4 text-[10px] uppercase tracking-[0.25em] text-white/45">
            How your answers added up
          </p>
          <ul className="space-y-3">
            {result.ranking.map((slug) => {
              const item = getFragrance(slug);
              const score = result.scores[slug];
              return (
                <li key={slug} className="flex items-center gap-4 text-xs">
                  <span className="w-24 shrink-0 font-mono tracking-[0.15em] text-white/70">
                    {item.name}
                  </span>
                  <span aria-hidden="true" className="h-[2px] flex-1 bg-white/10">
                    <span
                      className="block h-full bg-[#d4af37]"
                      style={{ width: `${(score / total) * 100}%` }}
                    />
                  </span>
                  <span className="w-10 shrink-0 text-right font-mono text-white/60">
                    {score} / {total}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-[#d4af37]/80">
          Fragrance concepts in development · Not yet available to purchase
        </p>
      </div>
    </div>
  );
}
