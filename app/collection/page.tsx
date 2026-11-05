import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import WaitlistSection from "@/components/waitlist/WaitlistSection";
import { siteConfig } from "@/config/site";
import { fragrances } from "@/data/fragrances";

export const metadata: Metadata = {
  title: "The Collection",
  description:
    "Four fragrance concepts in development: Aurora, Eclipse, Corona and Nocturne. Each translates a different behaviour of light into scent.",
  alternates: { canonical: "/collection" },
  openGraph: {
    title: "The Collection | SOLSTICE",
    description:
      "Four fragrance concepts in development: Aurora, Eclipse, Corona and Nocturne.",
    url: "/collection",
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
};

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]";
const gold = `inline-flex min-h-12 items-center justify-center border border-[#d4af37]/70 px-9 text-[11px] uppercase tracking-[0.25em] text-[#e9d6a0] transition-colors hover:bg-[#d4af37] hover:text-black ${focusRing}`;
const quiet = `inline-flex min-h-12 items-center justify-center px-4 text-[11px] uppercase tracking-[0.25em] text-white/60 transition-colors hover:text-white ${focusRing}`;

export default function CollectionPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />

      {/* Intro: above the fold, so it uses the CSS entrance rather than Reveal. */}
      <section className="relative overflow-hidden pb-20 pt-36 md:pb-28 md:pt-48">
        <div
          aria-hidden="true"
          className="hero-atmosphere pointer-events-none absolute inset-0"
        />
        {/* Four soft pools of light, one per fragrance. Decorative. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] overflow-hidden"
        >
          {fragrances.map((fragrance, index) => (
            <div
              key={fragrance.slug}
              className="absolute top-0 h-72 w-72 rounded-full blur-3xl md:h-[26rem] md:w-[26rem]"
              style={{
                left: `${8 + index * 24}%`,
                background: `radial-gradient(circle, ${fragrance.accent}30, transparent 68%)`,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <p className="rise-in mb-8 text-[10px] uppercase tracking-[0.4em] text-[#e2c979] md:text-xs">
            The collection · Concepts in development
          </p>
          <h1
            className="rise-in max-w-5xl font-display text-[clamp(2.5rem,10vw,7.5rem)] leading-[0.95] tracking-[-0.04em]"
            style={{ animationDelay: "120ms" }}
          >
            Four expressions.
            <br />
            <span className="italic text-[#d4af37]">One source of light.</span>
          </h1>
          <p
            className="rise-in mt-9 max-w-xl text-sm leading-8 text-white/60 md:text-base"
            style={{ animationDelay: "260ms" }}
          >
            Aurora, Eclipse, Corona and Nocturne: each fragrance concept takes a different
            behaviour of light and imagines it as scent.
          </p>
          <div
            className="rise-in mt-11 flex flex-col gap-3 sm:flex-row sm:items-center"
            style={{ animationDelay: "400ms" }}
          >
            <a href="#fragrances" className={gold}>
              Meet the four
            </a>
            <Link href="/waitlist" className={quiet}>
              Join the waitlist →
            </Link>
          </div>
        </div>
      </section>

      {/* The four fragrances */}
      <section
        id="fragrances"
        aria-label="The four fragrance concepts"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 pb-24 md:pb-36"
      >
        <ul className="grid gap-8 md:grid-cols-2">
          {fragrances.map((fragrance, index) => (
            <li key={fragrance.slug} className="min-w-0">
              <Reveal delay={(index % 2) * 0.12} className="h-full">
                <article className="group relative flex h-full flex-col overflow-hidden border border-white/10 bg-[#101014]">
                  {/* Hover / focus: a wash of this fragrance's own light and a hairline in its colour. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-700 group-focus-within:opacity-100 group-hover:opacity-100"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${fragrance.accent}66`,
                      background: `radial-gradient(ellipse 80% 45% at 50% 0%, ${fragrance.accent}1f, transparent 70%)`,
                    }}
                  />
                  {/* Duplicate of the heading link below: kept out of the tab order. */}
                  <Link
                    href={`/fragrances/${fragrance.slug}`}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="block"
                  >
                    {/* 3:2 matches the photographs exactly, so bottle and packaging are never cropped. */}
                    <div
                      className={`relative aspect-[3/2] overflow-hidden bg-[#121216] aura-${fragrance.slug}`}
                    >
                      <ImageReveal className="absolute inset-0">
                        <Image
                          src={fragrance.image}
                          alt={`SOLSTICE ${fragrance.name} perfume bottle and packaging concept`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          priority={index < 2}
                          className="object-cover transition-transform duration-1000 ease-out motion-safe:group-hover:scale-[1.025]"
                        />
                      </ImageReveal>
                      <span className="absolute left-5 top-5 border border-white/20 bg-black/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
                        No. {fragrance.number} · Concept
                      </span>
                    </div>
                  </Link>

                  <div className="relative flex flex-1 flex-col p-7 md:p-10">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#d4af37]">
                      {fragrance.mood}
                    </p>
                    <h2 className="font-display text-4xl lg:text-5xl">
                      <Link
                        href={`/fragrances/${fragrance.slug}`}
                        className={`transition-colors duration-300 hover:text-[#d4af37] ${focusRing}`}
                      >
                        {fragrance.name}
                      </Link>
                    </h2>
                    <p className="mt-2 font-display text-lg italic text-white/55">
                      {fragrance.subtitle}
                    </p>
                    <ul
                      aria-label={`${fragrance.name} character`}
                      className="mt-5 flex flex-wrap gap-2"
                    >
                      {fragrance.character.map((word) => (
                        <li
                          key={word}
                          className="border px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/75"
                          style={{ borderColor: `${fragrance.accent}55` }}
                        >
                          {word}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-5 text-sm leading-7 text-white/70">
                      {fragrance.description}
                    </p>

                    <div className="mt-7 border-t border-white/10 pt-5">
                      <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/45">
                        The fragrance notes
                      </p>
                      <p className="text-xs leading-7 text-white/70">
                        {fragrance.notes.join(" · ")}
                      </p>
                    </div>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-6">
                      <Link
                        href={`/fragrances/${fragrance.slug}`}
                        className={`inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors duration-300 hover:text-white ${focusRing}`}
                      >
                        Discover {fragrance.name} →
                      </Link>
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#d4af37]/80">
                        Concept in development
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-xl text-xs leading-6 text-white/40">
          These are fragrance concepts. They are still in development and are not yet
          available to purchase. Imagery shows design concepts, not final products.
        </p>
      </section>

      <WaitlistSection
        id="waitlist"
        heading={
          <>
            Be first to experience{" "}
            <span className="italic text-[#d4af37]">the light.</span>
          </>
        }
      />

      <Footer />
    </main>
  );
}
