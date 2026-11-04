/**
 * Verifies the Find Your Light content and scoring without any test framework.
 *
 *   npm run verify:quiz
 *
 * Checks the question data, then runs every one of the 4^5 = 1,024 possible
 * answer combinations through `computeQuizResult` and compares the outcome
 * with a separately written oracle that applies the documented rules directly:
 * most points wins; on a tie, the fragrance chosen earliest wins.
 */
import { fragrances, type FragranceSlug } from "@/data/fragrances";
import { quizQuestions } from "@/data/quiz";
import { buildExplanation } from "@/lib/quiz/explanation";
import { computeQuizResult } from "@/lib/quiz/scoring";

let failures = 0;
function check(condition: boolean, message: string): void {
  if (!condition) {
    failures += 1;
    if (failures <= 20) console.error(`FAIL  ${message}`);
  }
}

const slugs = fragrances.map((fragrance) => fragrance.slug);

/* ---------------------------------------------------------------- data */

check(quizQuestions.length === 5, `expected 5 questions, found ${quizQuestions.length}`);
check(
  new Set(quizQuestions.map((question) => question.id)).size === quizQuestions.length,
  "question ids are not unique"
);

for (const question of quizQuestions) {
  check(question.options.length === 4, `${question.id}: expected 4 options`);
  check(
    new Set(question.options.map((option) => option.id)).size === question.options.length,
    `${question.id}: option ids are not unique`
  );
  const offered = question.options.map((option) => option.fragrance).sort();
  check(
    JSON.stringify(offered) === JSON.stringify([...slugs].sort()),
    `${question.id}: options must cover each fragrance exactly once (got ${offered.join(", ")})`
  );
}

/* -------------------------------------------------------------- oracle */

function oracle(picks: readonly FragranceSlug[]) {
  const counts = new Map<FragranceSlug, number>();
  for (const pick of picks) counts.set(pick, (counts.get(pick) ?? 0) + 1);

  const top = Math.max(...counts.values());
  const tied = [...counts].filter(([, count]) => count === top).map(([slug]) => slug);
  // The earliest answer that belongs to a tied fragrance decides.
  const winner = picks.find((pick) => tied.includes(pick));

  const others = [...counts].filter(([slug]) => slug !== winner);
  let secondary: FragranceSlug | null = null;
  if (others.length > 0) {
    const second = Math.max(...others.map(([, count]) => count));
    const tiedSecond = others
      .filter(([, count]) => count === second)
      .map(([slug]) => slug);
    secondary =
      picks.find((pick) => pick !== winner && tiedSecond.includes(pick)) ?? null;
  }

  return { winner, tiedCount: tied.length, secondary };
}

/* ---------------------------------------------------- every combination */

const optionCount = quizQuestions[0]?.options.length ?? 0;
const combinations = optionCount ** quizQuestions.length;

const primaryTally: Record<string, number> = Object.fromEntries(
  slugs.map((slug) => [slug, 0])
);
let tieCount = 0;
let noSecondaryCount = 0;

for (let n = 0; n < combinations; n += 1) {
  const optionIds: string[] = [];
  const picks: FragranceSlug[] = [];
  let rest = n;

  for (const question of quizQuestions) {
    const option = question.options[rest % optionCount];
    rest = Math.floor(rest / optionCount);
    if (!option) throw new Error("option index out of range");
    optionIds.push(option.id);
    picks.push(option.fragrance);
  }

  const label = optionIds.join(" / ");
  const result = computeQuizResult(optionIds);
  const expected = oracle(picks);

  check(
    result.primary === expected.winner,
    `${label}: primary ${result.primary}, expected ${expected.winner}`
  );
  check(
    result.secondary === expected.secondary,
    `${label}: secondary ${result.secondary}, expected ${expected.secondary}`
  );
  check(result.tiedForFirst.length === expected.tiedCount, `${label}: tie size mismatch`);
  check(
    Object.values(result.scores).reduce((sum, score) => sum + score, 0) ===
      quizQuestions.length,
    `${label}: scores do not sum to ${quizQuestions.length}`
  );
  check(
    new Set(result.ranking).size === slugs.length && result.ranking[0] === result.primary,
    `${label}: ranking is not a full ordering starting with the primary`
  );
  check(result.secondary !== result.primary, `${label}: secondary equals primary`);

  const again = computeQuizResult(optionIds);
  check(
    JSON.stringify(again) === JSON.stringify(result),
    `${label}: result is not deterministic`
  );

  const paragraphs = buildExplanation(result);
  check(
    paragraphs.length >= 2 && paragraphs.every((text) => text.trim().length > 0),
    `${label}: explanation is empty`
  );
  check(
    (paragraphs[0] ?? "").includes(result.primary.toUpperCase()),
    `${label}: explanation does not name the recommended fragrance`
  );
  check(
    paragraphs.length === (result.tiedForFirst.length > 1 ? 3 : 2),
    `${label}: tie paragraph shown/hidden incorrectly`
  );

  primaryTally[result.primary] = (primaryTally[result.primary] ?? 0) + 1;
  if (result.tiedForFirst.length > 1) tieCount += 1;
  if (result.secondary === null) noSecondaryCount += 1;
}

/* ------------------------------------------------------ spot checks */

for (const slug of slugs) {
  const unanimous = quizQuestions.map(
    (question) => question.options.find((option) => option.fragrance === slug)?.id ?? ""
  );
  const result = computeQuizResult(unanimous);
  check(
    result.primary === slug && result.scores[slug] === 5,
    `unanimous ${slug} did not score 5/5`
  );
  check(result.secondary === null, `unanimous ${slug} should have no secondary`);
}

let threw = false;
try {
  computeQuizResult(["northern-lights"]);
} catch (error) {
  threw = error instanceof RangeError;
}
check(threw, "too few answers should throw a RangeError");

threw = false;
try {
  computeQuizResult(["nope", "nope", "nope", "nope", "nope"]);
} catch {
  threw = true;
}
check(threw, "unknown option ids should throw");

for (const slug of slugs) {
  check((primaryTally[slug] ?? 0) > 0, `${slug} can never be recommended`);
}

/* ------------------------------------------------------------ report */

console.log(`Questions checked:        ${quizQuestions.length}`);
console.log(`Combinations checked:     ${combinations}`);
console.log(
  `Recommended as primary:   ${slugs.map((slug) => `${slug} ${primaryTally[slug]}`).join(" · ")}`
);
console.log(`Resolved by tie-break:    ${tieCount}`);
console.log(`Without a secondary:      ${noSecondaryCount}`);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed.`);
  process.exit(1);
}
console.log("\nAll checks passed.");
