/**
 * App-wide constants with no runtime dependencies.
 *
 * Distinct from `lib/utils.ts` (which holds functions like `cn()` that
 * depend on `clsx` / `tailwind-merge`): this file is safe to import from
 * anywhere, including edge runtimes and config files.
 */

/** Mirrors the `sm/md/lg/xl/2xl` breakpoints in `tailwind.config.ts`. */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1440,
} as const;

/** Shared z-index scale so overlays never fight each other by accident. */
export const Z_INDEX = {
  base: 0,
  content: 10,
  header: 40,
  overlay: 50,
  modal: 60,
  toast: 70,
} as const;

export const SITE_NAME = "SOLSTICE";
