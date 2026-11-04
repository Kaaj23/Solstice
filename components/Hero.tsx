import Link from "next/link";

import { fragrances } from "@/data/fragrances";

/**
 * Hero motion is CSS-only: a slow drifting pool of light behind the headline
 * and a staggered entrance for the copy. Both are switched off under
 * `prefers-reduced-motion` (see globals.css), and neither can cause hydration
 * differences or layout shift because they only touch opacity and transform.
 *
 * The layout is a single flex column (copy centred, the four atmospheres along
 * the bottom edge), so nothing is absolutely positioned over the copy on short
 * or narrow screens.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden px-6 pb-6 pt-28 text-center md:pt-32">
      <div
        aria-hidden="true"
        className="hero-atmosphere pointer-events-none absolute inset-0"
      />
      <div
        aria-hidden="true"
        className="light-drift pointer-events-none absolute inset-[-10%]"
        style={{
          background:
            "radial-gradient(ellipse 30% 36% at 55% 44%, rgba(212,175,55,.11), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[42%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4af37]/20 shadow-[0_0_110px_25px_rgba(212,175,55,0.08)] md:h-[520px] md:w-[520px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center py-10">
        <p className="rise-in mb-8 text-[10px] uppercase tracking-[0.45em] text-[#e2c979] md:text-xs">
          Scents Defined by Light
        </p>
        <h1 className="rise-in font-display text-[clamp(2.75rem,15vw,4.5rem)] font-normal leading-[0.92] tracking-[-0.055em] md:text-[clamp(4.2rem,13vw,11rem)]">
          SOLSTICE
        </h1>
        <p
          className="rise-in mt-7 max-w-3xl font-display text-[1.65rem] italic leading-tight text-[#e6d9bb] md:text-4xl"
          style={{ animationDelay: "200ms" }}
        >
          Every fragrance begins as light.
        </p>
        <p
          className="rise-in mx-auto mt-8 max-w-lg text-sm leading-8 text-white/60 md:text-base"
          style={{ animationDelay: "340ms" }}
        >
          Polar glow, shadow, radiance and starlit quiet: four behaviours of light, each
          imagined as a world of scent.
        </p>
        <div
          className="rise-in mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          style={{ animationDelay: "480ms" }}
        >
          <a
            href="#collection"
            className="inline-flex min-h-12 items-center border border-[#d4af37]/70 bg-black/30 px-10 text-[11px] uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
          >
            Explore collection
          </a>
          <Link
            href="/find-your-light"
            className="inline-flex min-h-12 items-center px-6 text-[11px] uppercase tracking-[0.25em] text-white/70 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
          >
            Find your light
          </Link>
        </div>
      </div>

      {/* The four atmospheres: a quiet index of the collection. */}
      <nav
        aria-label="The four fragrances"
        className="rise-in relative z-10 mx-auto w-full max-w-3xl border-t border-white/10 pt-2"
        style={{ animationDelay: "640ms" }}
      >
        <ul className="grid grid-cols-2 sm:grid-cols-4">
          {fragrances.map((fragrance) => (
            <li key={fragrance.slug}>
              <Link
                href={`/fragrances/${fragrance.slug}`}
                className="group inline-flex min-h-11 w-full items-center justify-center gap-3 text-[10px] uppercase tracking-[0.28em] text-white/55 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#d4af37]"
              >
                <span
                  aria-hidden="true"
                  className="h-1.5 w-1.5 rounded-full transition-transform duration-300 group-hover:scale-150"
                  style={{
                    backgroundColor: fragrance.accent,
                    boxShadow: `0 0 10px 1px ${fragrance.accent}88`,
                  }}
                />
                {fragrance.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
