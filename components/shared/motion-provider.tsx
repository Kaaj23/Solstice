"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

/**
 * Applies the visitor's `prefers-reduced-motion` setting to every Framer
 * Motion animation in the app: transform and layout animations are switched
 * off, while plain opacity fades are kept.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
