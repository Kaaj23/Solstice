"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Wraps `next-themes` so it can be imported into the (server) root layout.
 * SOLSTICE defaults to — and is designed around — the dark theme, but the
 * provider is left in place for a future light-mode / system toggle.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
