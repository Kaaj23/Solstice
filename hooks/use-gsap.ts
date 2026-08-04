"use client";

import * as React from "react";
import type { RefObject } from "react";

import { gsap } from "@/lib/gsap";

/**
 * Runs a GSAP animation callback scoped to `scope`, cleaning up all
 * tweens/ScrollTriggers created inside it on unmount. Mirrors the
 * `useGSAP` pattern from `@gsap/react` without adding the dependency.
 *
 * @example
 * const root = useRef<HTMLDivElement>(null);
 * useGsapContext(() => {
 *   gsap.from(".reveal", { opacity: 0, y: 40, stagger: 0.1 });
 * }, root);
 */
export function useGsapContext(
  callback: (context: gsap.Context) => void,
  scope: RefObject<HTMLElement | null>,
  deps: React.DependencyList = []
) {
  React.useLayoutEffect(() => {
    if (!scope.current) return;

    const ctx = gsap.context(callback, scope.current);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
