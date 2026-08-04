"use client";

import * as React from "react";

/**
 * Tracks the user's `prefers-reduced-motion` setting so ambient effects
 * (aura drift, parallax, GSAP scrub) can be disabled or simplified —
 * required by the project's motion-accessibility baseline.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  return reduced;
}
