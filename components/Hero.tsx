import Link from "next/link";

/**
 * Hero motion is CSS-only: a slow drifting pool of light behind the headline
 * and a staggered entrance for the copy. Both are switched off under
 * `prefers-reduced-motion` (see globals.css), and neither can cause hydration
 * differences or layout shift because they only touch opacity and transform.
 */
export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-24 pt-32 text-center">
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
        className="pointer-events-none absolute left-1/2 top-[44%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4af37]/20 shadow-[0_0_110px_25px_rgba(212,175,55,0.08)] md:h-[520px] md:w-[520px]"
      />
      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="rise-in mb-9 text-[10px] uppercase tracking-[0.45em] text-[#e2c979] md:text-xs">
          An exploration of the extraordinary
        </p>
        <h1 className="rise-in font-display text-[clamp(2.75rem,15vw,4.5rem)] font-normal leading-[0.92] tracking-[-0.055em] md:text-[clamp(4.2rem,13vw,11rem)]">
          SOLSTICE
        </h1>
        <p
          className="rise-in mt-7 font-display text-2xl italic text-[#e6d9bb] md:text-4xl"
          style={{ animationDelay: "200ms" }}
        >
          Scents Defined by Light.
        </p>
        <p
          className="rise-in mx-auto mt-9 max-w-lg text-sm leading-8 text-white/60 md:text-base"
          style={{ animationDelay: "340ms" }}
        >
          Where the phenomena of light become the art of fragrance. Four worlds. Four
          atmospheres. An entirely new way to experience scent.
        </p>
        <div
          className="rise-in mt-11 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          style={{ animationDelay: "480ms" }}
        >
          <a
            href="#collection"
            className="inline-flex min-h-12 items-center border border-[#d4af37]/70 bg-black/30 px-10 text-[11px] uppercase tracking-[0.25em] text-[#e9d6a0] transition-all hover:bg-[#d4af37] hover:text-black"
          >
            Enter the collection
          </a>
          <Link
            href="/find-your-light"
            className="inline-flex min-h-12 items-center px-6 text-[11px] uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white"
          >
            Find your light
          </Link>
        </div>
      </div>
      <a
        href="#collection"
        className="absolute bottom-6 left-1/2 inline-flex min-h-11 -translate-x-1/2 items-center whitespace-nowrap text-[10px] uppercase tracking-[0.35em] text-white/45 transition-colors hover:text-white/80"
      >
        Scroll to discover ↓
      </a>
    </section>
  );
}
