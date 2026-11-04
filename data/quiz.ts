import type { FragranceSlug } from "@/data/fragrances";

/**
 * Find Your Light — consultation content.
 *
 * Pure data, no UI. Every option points at exactly one fragrance and is worth
 * one point to it (see `lib/quiz/scoring.ts` for the scoring and tie-break
 * rules). Each question offers all four fragrances exactly once; that
 * invariant is checked by `scripts/verify-quiz.ts`.
 */

export interface QuizOption {
  /** Stable id, unique within its question. */
  id: string;
  label: string;
  /** The fragrance this answer awards a point to. */
  fragrance: FragranceSlug;
}

export interface QuizQuestion {
  id: string;
  /** Short name used for the progress indicator and the result summary. */
  topic: string;
  prompt: string;
  options: readonly QuizOption[];
}

export const quizQuestions: readonly QuizQuestion[] = [
  {
    id: "atmosphere",
    topic: "Atmosphere",
    prompt: "Which atmosphere feels most like you?",
    options: [
      { id: "northern-lights", label: "The northern lights", fragrance: "aurora" },
      { id: "solar-eclipse", label: "A total solar eclipse", fragrance: "eclipse" },
      { id: "golden-hour", label: "Golden-hour sunlight", fragrance: "corona" },
      { id: "starlit-night", label: "A quiet starlit night", fragrance: "nocturne" },
    ],
  },
  {
    id: "family",
    topic: "Fragrance family",
    prompt: "Which fragrance family attracts you?",
    options: [
      { id: "fresh-green", label: "Fresh and green", fragrance: "aurora" },
      { id: "smoky-woody", label: "Smoky and woody", fragrance: "eclipse" },
      { id: "warm-amber", label: "Warm and amber", fragrance: "corona" },
      { id: "soft-floral", label: "Soft, floral and comforting", fragrance: "nocturne" },
    ],
  },
  {
    id: "feeling",
    topic: "Feeling",
    prompt: "What feeling do you want your fragrance to express?",
    options: [
      { id: "freedom", label: "Freedom and adventure", fragrance: "aurora" },
      { id: "mystery", label: "Mystery and strength", fragrance: "eclipse" },
      { id: "confidence", label: "Confidence and warmth", fragrance: "corona" },
      { id: "intimacy", label: "Intimacy and elegance", fragrance: "nocturne" },
    ],
  },
  {
    id: "setting",
    topic: "Setting",
    prompt: "Which setting feels most appealing?",
    options: [
      {
        id: "frozen-mountain",
        label: "A frozen mountain landscape",
        fragrance: "aurora",
      },
      {
        id: "evening-skyline",
        label: "A dramatic evening skyline",
        fragrance: "eclipse",
      },
      { id: "desert-horizon", label: "A sunlit desert horizon", fragrance: "corona" },
      {
        id: "midnight-garden",
        label: "A peaceful midnight garden",
        fragrance: "nocturne",
      },
    ],
  },
  {
    id: "impression",
    topic: "Impression",
    prompt: "What impression would you like to leave?",
    options: [
      { id: "refreshing", label: "Refreshing and unforgettable", fragrance: "aurora" },
      { id: "powerful", label: "Powerful and intriguing", fragrance: "eclipse" },
      { id: "radiant", label: "Radiant and welcoming", fragrance: "corona" },
      { id: "subtle", label: "Subtle and captivating", fragrance: "nocturne" },
    ],
  },
];
