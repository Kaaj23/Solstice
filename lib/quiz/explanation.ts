import { getFragrance } from "@/data/fragrances";
import { quizQuestions } from "@/data/quiz";
import type { QuizResult } from "@/lib/quiz/scoring";

const NUMBER_WORDS = ["no", "one", "two", "three", "four", "five"] as const;

/** "a" · "a and b" · "a, b and c" */
export function formatList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Builds the personalised explanation shown with the recommendation, as a
 * list of short paragraphs. It only restates what the person actually chose
 * plus the fragrance's own data — nothing is invented.
 */
export function buildExplanation(result: QuizResult): string[] {
  const fragrance = getFragrance(result.primary);
  const matched = result.matches[result.primary];
  const total = quizQuestions.length;

  const lead =
    matched.length === total
      ? "Every one of your answers"
      : `${capitalise(NUMBER_WORDS[matched.length] ?? String(matched.length))} of your ${total} answers`;
  const choices = formatList(matched.map((choice) => `“${choice.label}”`));

  const paragraphs = [
    `${lead} pointed to ${fragrance.name}: ${choices}.`,
    `${fragrance.name} is ${formatList(fragrance.personality)}. ${fragrance.description}`,
  ];

  if (result.tiedForFirst.length > 1) {
    const names = formatList(result.tiedForFirst.map((slug) => getFragrance(slug).name));
    paragraphs.push(
      `Your answers were evenly split between ${names}, so the tie goes to the one you reached for first: ${fragrance.name}.`
    );
  }

  return paragraphs;
}
