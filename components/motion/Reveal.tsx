"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { EASE_CINEMATIC } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before the reveal starts. */
  delay?: number;
}

/**
 * Fades and lifts its content into place once, the first time it scrolls into
 * view. Use for below-the-fold content only: its server-rendered state is
 * transparent, so anything above the fold should use the CSS `rise-in` class.
 *
 * Reduced motion is handled globally by `MotionProvider` (no movement, fade
 * only), and the animation uses opacity/transform so it never shifts layout.
 */
export default function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.9, ease: EASE_CINEMATIC, delay }}
    >
      {children}
    </motion.div>
  );
}
