import type { Transition, Variants } from "framer-motion";

/**
 * Shared Framer Motion presets for SOLSTICE.
 *
 * Centralizing these keeps every cinematic reveal, card float, and page
 * transition (built in later phases) moving on the same easing language
 * instead of each component inventing its own timing.
 */

export const EASE_CINEMATIC: [number, number, number, number] = [0.16, 1, 0.3, 1];
export const EASE_REFRACT: [number, number, number, number] = [0.65, 0, 0.35, 1];

export const transitionCinematic: Transition = {
  duration: 0.8,
  ease: EASE_CINEMATIC,
};

export const transitionRefract: Transition = {
  duration: 0.6,
  ease: EASE_REFRACT,
};

/** Fade + rise — the default reveal for headlines and hero copy. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionCinematic,
  },
};

/** Soft scale-in — for floating cards and glass panels. */
export const floatIn: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: transitionCinematic,
  },
};

/** Staggers direct children — wrap a section in this, use `fadeUp` on kids. */
export const staggerContainer = (stagger = 0.12, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren,
    },
  },
});

/** Ambient, near-infinite drift for aura/mesh backgrounds. */
export const auraDrift: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    x: ["0%", "2%", "0%"],
    y: ["0%", "-3%", "0%"],
    transition: {
      duration: 12,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};
