/**
 * Shared, cross-cutting types for SOLSTICE.
 *
 * Content-model types (reviews, brands, product listings) belong to their
 * own phases and aren't defined yet — this file only holds types the
 * design system itself already depends on.
 */

/** The four light-phenomena scent lines that drive palette + copy tone. */
export type ScentAura = "aurora" | "eclipse" | "corona" | "nocturne";

export const SCENT_AURAS: readonly ScentAura[] = [
  "aurora",
  "eclipse",
  "corona",
  "nocturne",
] as const;

/** `next-themes` currently only ships `dark`, with `light` reserved. */
export type ThemeMode = "dark" | "light";
