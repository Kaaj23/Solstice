/**
 * A soft fade between routes. CSS-only and opacity-only (no transform), so it
 * cannot affect the fixed header, hydration or layout, and it is disabled
 * under `prefers-reduced-motion` in globals.css.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
