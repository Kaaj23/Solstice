"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { EASE_CINEMATIC } from "@/lib/motion";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
}

/**
 * A slow, soft settle for photography: the image fades in while easing from a
 * very slightly enlarged state to its natural size, once, when it scrolls into
 * view. The wrapper must sit inside an `overflow-hidden` frame so the
 * enlarged state is never visible outside it. Transform and opacity only, so
 * there is no layout shift; reduced motion is handled by `MotionProvider`.
 */
export default function ImageReveal({ children, className }: ImageRevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 1.04 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 1.3, ease: EASE_CINEMATIC }}
    >
      {children}
    </motion.div>
  );
}
