"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * GSAP plugin registration, run exactly once on the client.
 *
 * Import `gsap` from this module (instead of directly from "gsap")
 * anywhere ScrollTrigger-driven work is needed — e.g. the pinned scent
 * sequences and scroll-scrubbed light phenomena planned for Phase 2's
 * cinematic landing — so registration always happens before use.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Respect the user's motion preference across every GSAP timeline.
  gsap.config({
    nullTargetWarn: false,
  });
}

export { gsap, ScrollTrigger };
