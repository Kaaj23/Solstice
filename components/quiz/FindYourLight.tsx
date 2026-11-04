"use client";

import * as React from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";

import QuestionStep from "@/components/quiz/QuestionStep";
import QuizIntro from "@/components/quiz/QuizIntro";
import QuizProgress from "@/components/quiz/QuizProgress";
import QuizResultView from "@/components/quiz/QuizResultView";
import { fragrances, type FragranceSlug } from "@/data/fragrances";
import { quizQuestions } from "@/data/quiz";
import { EASE_CINEMATIC } from "@/lib/motion";
import { computeQuizResult } from "@/lib/quiz/scoring";
import { cn } from "@/lib/utils";

type Phase = "intro" | "questions" | "result";
type Answers = readonly (string | null)[];

const EMPTY_ANSWERS: Answers = quizQuestions.map(() => null);
const TOPICS = quizQuestions.map((question) => question.topic);

/**
 * The atmosphere behind the consultation. All four aura layers stay mounted
 * and only cross-fade their opacity, so tinting the background to the
 * fragrance being considered costs no layout work and never shifts content.
 */
function Backdrop({ tint, showRing }: { tint: FragranceSlug | null; showRing: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="hero-atmosphere absolute inset-0" />
      {/* The ring frames the intro headline only; on busier screens it would cut through content. */}
      {showRing && (
        <div className="absolute left-1/2 top-1/2 h-[min(90vw,520px)] w-[min(90vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4af37]/15" />
      )}
      {fragrances.map((fragrance) => (
        <div
          key={fragrance.slug}
          className={cn(
            `aura-${fragrance.slug}`,
            "absolute inset-0 transition-opacity duration-1000 ease-out",
            tint === fragrance.slug ? "opacity-100" : "opacity-0"
          )}
        />
      ))}
    </div>
  );
}

export default function FindYourLight() {
  const [phase, setPhase] = React.useState<Phase>("intro");
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<Answers>(EMPTY_ANSWERS);
  const [hasStarted, setHasStarted] = React.useState(false);

  const firstUnanswered = answers.findIndex((answer) => answer === null);
  const reachable = firstUnanswered === -1 ? quizQuestions.length - 1 : firstUnanswered;

  const result = React.useMemo(() => {
    if (
      phase !== "result" ||
      !answers.every((answer): answer is string => answer !== null)
    ) {
      return null;
    }
    return computeQuizResult(answers);
  }, [phase, answers]);

  const currentQuestion = quizQuestions[step];
  const chosenOption =
    phase === "questions"
      ? currentQuestion?.options.find((option) => option.id === answers[step])
      : undefined;
  const tint: FragranceSlug | null = result?.primary ?? chosenOption?.fragrance ?? null;

  const begin = () => {
    setHasStarted(true);
    setStep(0);
    setPhase("questions");
  };

  const select = (optionId: string) => {
    setAnswers((previous) =>
      previous.map((answer, index) => (index === step ? optionId : answer))
    );
  };

  const next = () => {
    if (answers[step] === null) return;
    if (step < quizQuestions.length - 1) setStep(step + 1);
    else setPhase("result");
  };

  const back = () => {
    if (step > 0) setStep(step - 1);
    else setPhase("intro");
  };

  const goTo = (index: number) => {
    if (index <= reachable) setStep(index);
  };

  const restart = () => {
    setAnswers(EMPTY_ANSWERS);
    setStep(0);
    setPhase("questions");
  };

  let screen: React.ReactNode = null;
  let screenKey: string = phase;

  if (phase === "intro") {
    screen = <QuizIntro onBegin={begin} focusHeading={hasStarted} />;
  } else if (phase === "questions" && currentQuestion) {
    screenKey = `question-${currentQuestion.id}`;
    screen = (
      <QuestionStep
        question={currentQuestion}
        index={step}
        total={quizQuestions.length}
        selected={answers[step] ?? null}
        onSelect={select}
        onBack={back}
        onNext={next}
      />
    );
  } else if (phase === "result" && result) {
    screen = <QuizResultView result={result} onRestart={restart} />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-label="Find your light"
        className="relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden px-6 pb-16 pt-28 md:pt-32"
      >
        <Backdrop tint={tint} showRing={phase === "intro"} />

        {phase === "questions" && (
          <div className="mx-auto mb-10 flex w-full max-w-2xl items-end gap-6">
            <div className="flex-1">
              <QuizProgress
                topics={TOPICS}
                current={step}
                reachable={reachable}
                onSelect={goTo}
              />
            </div>
            <button
              type="button"
              onClick={restart}
              className="inline-flex h-11 items-center pb-1 text-[11px] uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
            >
              Restart
            </button>
          </div>
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={screenKey}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
            transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
            className="w-full"
          >
            {screen}
          </motion.div>
        </AnimatePresence>
      </section>
    </MotionConfig>
  );
}
