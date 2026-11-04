import { fragrances, type FragranceSlug } from "@/data/fragrances";
import { quizQuestions } from "@/data/quiz";

/**
 * Find Your Light — scoring.
 *
 * The rules are deliberately simple so anyone can check a result by hand:
 *
 * 1. Every answer awards `POINTS_PER_ANSWER` point to the one fragrance it
 *    belongs to. Five questions means five points are handed out in total.
 * 2. The fragrance with the most points is recommended.
 * 3. TIE-BREAK: if fragrances share the top score, the one the person chose
 *    EARLIEST in the consultation wins. Each tied fragrance has at least one
 *    answer, so this rule always produces exactly one winner — there is no
 *    random or hidden fallback.
 * 4. The secondary recommendation is the runner-up under the same ordering
 *    (score, then earliest answer). It is omitted when the runner-up scored
 *    nothing, i.e. when every answer pointed at the same fragrance.
 *
 * Fragrances that score nothing are ordered by their place in the catalogue
 * purely so the ranking is a total order; it never affects the winner or the
 * secondary recommendation.
 */

export const POINTS_PER_ANSWER = 1;

export type Scores = Record<FragranceSlug, number>;

export interface MatchedChoice {
  topic: string;
  label: string;
}

export interface QuizResult {
  scores: Scores;
  /** Every fragrance, best match first. */
  ranking: readonly FragranceSlug[];
  primary: FragranceSlug;
  secondary: FragranceSlug | null;
  /** Fragrances sharing the top score. Length 1 means there was no tie. */
  tiedForFirst: readonly FragranceSlug[];
  /** The answers that pointed at each fragrance, in the order given. */
  matches: Record<FragranceSlug, readonly MatchedChoice[]>;
}

const CATALOG_ORDER: readonly FragranceSlug[] = fragrances.map(
  (fragrance) => fragrance.slug
);

function recordOf<T>(make: () => T): Record<FragranceSlug, T> {
  return Object.fromEntries(CATALOG_ORDER.map((slug) => [slug, make()])) as Record<
    FragranceSlug,
    T
  >;
}

/**
 * @param optionIds One chosen option id per question, in question order.
 * @throws RangeError if the number of answers does not match the questions.
 * @throws Error if an id does not belong to its question.
 */
export function computeQuizResult(optionIds: readonly string[]): QuizResult {
  if (optionIds.length !== quizQuestions.length) {
    throw new RangeError(
      `Expected ${quizQuestions.length} answers but received ${optionIds.length}.`
    );
  }

  const scores = recordOf(() => 0);
  const firstPick = recordOf(() => quizQuestions.length);
  const matches = recordOf<MatchedChoice[]>(() => []);

  quizQuestions.forEach((question, index) => {
    const optionId = optionIds[index];
    const option = question.options.find((candidate) => candidate.id === optionId);

    if (!option) {
      throw new Error(
        `Unknown answer "${String(optionId)}" for question "${question.id}".`
      );
    }

    scores[option.fragrance] += POINTS_PER_ANSWER;
    firstPick[option.fragrance] = Math.min(firstPick[option.fragrance], index);
    matches[option.fragrance].push({ topic: question.topic, label: option.label });
  });

  const ranking = [...CATALOG_ORDER].sort(
    (a, b) =>
      scores[b] - scores[a] ||
      firstPick[a] - firstPick[b] ||
      CATALOG_ORDER.indexOf(a) - CATALOG_ORDER.indexOf(b)
  );

  const [primary, runnerUp] = ranking;
  if (!primary) {
    throw new Error("The fragrance catalogue is empty.");
  }

  return {
    scores,
    ranking,
    primary,
    secondary: runnerUp && scores[runnerUp] > 0 ? runnerUp : null,
    tiedForFirst: ranking.filter((slug) => scores[slug] === scores[primary]),
    matches,
  };
}
