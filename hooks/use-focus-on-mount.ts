"use client";

import * as React from "react";

/**
 * Moves keyboard/screen-reader focus to an element when it mounts.
 *
 * Used on quiz screen headings (with `tabIndex={-1}`) so that each new
 * question or result is announced and keyboard users continue from the top of
 * the new screen instead of being left on a control that just disappeared.
 * `preventScroll` avoids a jump on small screens.
 */
export function useFocusOnMount<T extends HTMLElement>(enabled = true) {
  const ref = React.useRef<T>(null);

  React.useEffect(() => {
    if (enabled) ref.current?.focus({ preventScroll: true });
  }, [enabled]);

  return ref;
}
