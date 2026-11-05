import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ParallaxImage from "@/components/motion/ParallaxImage";
import Reveal from "@/components/motion/Reveal";
import WaitlistSection from "@/components/waitlist/WaitlistSection";
import { fragrances } from "@/data/fragrances";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Discovery Set",
  description:
    "A concept in development: all four SOLSTICE atmospheres — Aurora, Eclipse, Corona and Nocturne — imagined together as one exploration of light.",
};

const gold =
  "inline-flex min-h-12 items-center justify-center border border-[#d4af37]/70 px-9 text-[11px] uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]";
const quiet =
  "inline-flex min-h-12 items-center justify-center px-4 text-[11px] uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]";

export default function DiscoverySetPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />

      {/* Hero — above the fold, so it uses the CSS entrance rather than Reveal. */}
      <section className="relative overflow-hidden px-6 pb-20 pt-36 md:pb-28 md:pt-48">
        <div
          aria-hidden="true"
          className="hero-atmosphere pointer-events-none absolute inset-0"
        />
        <div className="relative mx-auto max-w-7xl">
          <p className="rise-in mb-8 text-[10px] uppercase tracking-[0.4em] text-[#e2c979] md:text-xs">
            The Discovery Set · Concept in development
          </p>
          <h1
            className="rise-in max-w-5xl font-display text-[clamp(2.5rem,10vw,7.5rem)] leading-[0.95] tracking-[-0.04em]"
            style={{ animationDelay: "120ms" }}
          >
            Four atmospheres.
            <br />
            <span className="italic text-[#d4af37]">One exploration.</span>
          </h1>
          <p
            className="rise-in mt-9 max-w-xl text-sm leading-8 text-white/60 md:text-base"
            style={{ animationDelay: "260ms" }}
          >
            An imagined way to meet the whole house at once: Aurora, Eclipse, Corona and
            Nocturne, side by side — each a different behaviour of light.
          </p>
          <div
            className="rise-in mt-11 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "400ms" }}
          >
            <Link href="/find-your-light" className={gold}>
              Find your light
            </Link>
            <a href="#worlds" className={quiet}>
              Meet the four ↓
            </a>
          </div>

          <ol
            className="rise-in mt-16 grid grid-cols-2 gap-px border border-white/10 bg-white/10 md:mt-24 lg:grid-cols-4"
            style={{ animationDelay: "540ms" }}
          >
            {fragrances.map((fragrance) => (
              <li
                key={fragrance.slug}
                className={`min-w-0 bg-[#080808] p-4 sm:p-6 lg:p-7 aura-${fragrance.slug}`}
              >
                <p className="font-mono text-[11px] text-[#d4af37]">{fragrance.number}</p>
                <p className="mt-10 font-display text-[clamp(1.05rem,5.2vw,1.5rem)] sm:text-2xl md:mt-16 lg:text-3xl">
                  {fragrance.name}
                </p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-white/60">
                  {fragrance.mood}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The concept */}
      <section
        id="concept"
        className="scroll-mt-20 border-y border-white/10 px-6 py-24 md:py-36"
      >
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-24">
          <Reveal>
            <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
              01 / The concept
            </p>
            <h2 className="font-display text-4xl leading-tight md:text-6xl">
              Meet the whole house
              <br />
              <span className="italic text-white/55">in a single sitting.</span>
            </h2>
          </Reveal>
          <Reveal
            delay={0.1}
            className="space-y-6 text-sm leading-8 text-white/65 md:text-base md:leading-9"
          >
            <p>
              Every SOLSTICE fragrance is a different behaviour of light: the ionised cold
              of Aurora, the warmth hidden inside Eclipse, the radiance of Corona and the
              stillness of Nocturne. The Discovery Set imagines meeting all four together,
              so the differences can be felt side by side rather than read about.
            </p>
            <p>
              We picture a deliberate order of discovery — cold clarity first, then
              shadow, then radiance, and finally starlit quiet — so each atmosphere has
              room to be itself before the next begins.
            </p>
            <p className="text-white/45">
              This is a concept. The format and contents of the set have not been decided,
              and it is not yet available to purchase.
            </p>
          </Reveal>
        </div>
      </section>

      {/* The four worlds */}
      <section id="worlds" className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 md:py-36">
        <Reveal className="mb-16 md:mb-24">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            02 / The four worlds
          </p>
          <h2 className="max-w-3xl font-display text-4xl leading-tight md:text-6xl">
            Four ways light becomes scent.
          </h2>
        </Reveal>

        <div className="space-y-20 md:space-y-32">
          {fragrances.map((fragrance, index) => (
            <article
              key={fragrance.slug}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-20"
            >
              <Reveal className={cn(index % 2 === 1 && "lg:order-2")}>
                {/* Duplicate of the "Explore" link below: kept out of the tab order. */}
                <Link
                  href={`/fragrances/${fragrance.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="block"
                >
                  <ParallaxImage
                    src={fragrance.image}
                    alt={`SOLSTICE ${fragrance.name} bottle and packaging concept`}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className={`border border-white/10 bg-gradient-to-br ${fragrance.palette} bg-[#101014]`}
                  />
                </Link>
              </Reveal>

              <Reveal delay={0.1} className="min-w-0">
                <p className="mb-5 text-[10px] uppercase tracking-[0.3em] text-[#d4af37] md:text-xs">
                  No. {fragrance.number} · {fragrance.subtitle}
                </p>
                <h3 className="font-display text-[clamp(2.5rem,11vw,4.5rem)] leading-none tracking-tight">
                  {fragrance.name}
                </h3>
                <p className="mt-4 font-display text-xl italic text-[#e2c979] md:text-2xl">
                  {fragrance.mood}
                </p>
                <p className="mt-6 max-w-md text-sm leading-8 text-white/65 md:text-base">
                  {fragrance.description}
                </p>
                <ul className="mt-7 flex flex-wrap gap-2">
                  {fragrance.notes.map((note) => (
                    <li
                      key={note}
                      className="border border-white/15 px-4 py-2.5 text-xs text-white/80"
                    >
                      {note}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/fragrances/${fragrance.slug}`}
                  className="mt-8 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
                >
                  Explore {fragrance.name} →
                </Link>
              </Reveal>
            </article>
          ))}
        </div>

        <p className="mt-16 max-w-xl text-xs leading-6 text-white/40 md:mt-24">
          Imagery shows the individual fragrance concepts. It does not represent the
          format or contents of the Discovery Set, which are still to be decided.
        </p>
      </section>

      {/* Closing */}
      <section className="border-t border-white/10 px-6 py-24 text-center md:py-36">
        <Reveal className="mx-auto max-w-2xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            Concept in development
          </p>
          <h2 className="font-display text-4xl leading-tight md:text-6xl">
            Not sure where to <span className="italic">begin?</span>
          </h2>
          <p className="mx-auto mt-7 max-w-md text-sm leading-8 text-white/60 md:text-base">
            Answer five questions and we will suggest the atmosphere that suits you best —
            a natural first step into the set.
          </p>
          <Link href="/find-your-light" className={cn(gold, "mt-10")}>
            Find your light
          </Link>
          <p className="mt-8 text-[10px] uppercase tracking-[0.18em] text-[#d4af37]/80">
            The Discovery Set is a concept · Not yet available to purchase
          </p>
        </Reveal>
      </section>

      <WaitlistSection
        id="waitlist"
        heading={
          <>
            Be first to experience <span className="italic text-[#d4af37]">the light.</span>
          </>
        }
        body="The Discovery Set is a concept, and nothing about it has been decided. Join the list for fragrance development updates and launch announcements."
      />

      <Footer />
    </main>
  );
}
