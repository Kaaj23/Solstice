"use client";

import * as React from "react";

/**
 * Subscribes to a CSS media query, e.g. `useMediaQuery("(min-width: 1024px)")`.
 * SSR-safe: returns `false` until mounted, then syncs to the real match.
 */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false);

  React.useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    setMatches(mediaQueryList.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
