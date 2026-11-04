import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import Reveal from "@/components/motion/Reveal";
import { fragrances } from "@/data/fragrances";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />
      <Hero />
      <section
        id="collection"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 md:py-36"
      >
        <Reveal className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
              01 / The collection
            </p>
            <h2 className="font-display text-5xl leading-tight md:text-7xl">
              Four expressions.
              <br />
              <span className="italic text-[#d4af37]">One source of light.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/55">
            Each fragrance captures an atmospheric phenomenon, translating the language of
            light into an intimate sensory experience.
          </p>
        </Reveal>
        <div className="grid gap-8 md:grid-cols-2">
          {fragrances.map((fragrance, index) => (
            <Reveal key={fragrance.slug} delay={(index % 2) * 0.12} className="h-full">
              <article className="group h-full overflow-hidden border border-white/10 bg-[#101014] transition-colors duration-500 hover:border-[#d4af37]/40">
                {/* Decorative duplicate of the heading link below: kept out of the tab order. */}
                <Link
                  href={`/fragrances/${fragrance.slug}`}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="block"
                >
                  <div
                    className={`relative aspect-[4/3] overflow-hidden bg-[#121216] aura-${fragrance.slug}`}
                  >
                    <Image
                      src={fragrance.image}
                      alt={`SOLSTICE ${fragrance.name} perfume bottle and packaging concept`}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <span className="absolute left-5 top-5 border border-white/20 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
                      No. {fragrance.number} / Eau de parfum concept
                    </span>
                  </div>
                </Link>
                <div className="p-7 md:p-10">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#d4af37]">
                    {fragrance.mood}
                  </p>
                  <h3 className="font-display text-4xl lg:text-5xl">
                    <Link
                      href={`/fragrances/${fragrance.slug}`}
                      className="transition-colors duration-300 hover:text-[#d4af37]"
                    >
                      {fragrance.name}
                    </Link>
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/70">
                    {fragrance.description}
                  </p>
                  <div className="mt-7 border-t border-white/10 pt-5">
                    <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/45">
                      The fragrance notes
                    </p>
                    <p className="text-xs leading-7 text-white/70">
                      {fragrance.notes.join(" · ")}
                    </p>
                    <Link
                      href={`/fragrances/${fragrance.slug}`}
                      className="mt-6 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors duration-300 hover:text-white"
                    >
                      Discover fragrance →
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <section
        id="philosophy"
        className="scroll-mt-20 border-y border-white/10 px-6 py-28 text-center md:py-40"
      >
        <Reveal>
          <p className="mb-8 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            02 / Our philosophy
          </p>
          <h2 className="mx-auto max-w-4xl font-display text-4xl leading-tight md:text-7xl">
            Light is fleeting.
            <br />
            <span className="italic text-white/55">Its impression is eternal.</span>
          </h2>
          <p className="mx-auto mt-9 max-w-xl text-sm leading-8 text-white/55">
            A study in contrast: warmth and cold, radiance and shadow, the visible and the
            invisible. SOLSTICE transforms the phenomena above us into the stories we
            carry with us.
          </p>
        </Reveal>
      </section>
      <section
        id="discover"
        className="mx-auto max-w-5xl scroll-mt-20 px-6 py-28 text-center md:py-40"
      >
        <Reveal>
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            03 / Find your light
          </p>
          <h2 className="font-display text-5xl md:text-7xl">
            Your atmosphere.
            <br />
            <span className="italic">Your signature.</span>
          </h2>
          <p className="mx-auto mt-8 max-w-lg text-sm leading-8 text-white/55">
            Four distinct worlds. One personal connection. Discover the scent that
            reflects your own light.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-8">
            <Link
              href="/find-your-light"
              className="inline-flex min-h-12 items-center border border-[#d4af37]/60 px-9 text-xs uppercase tracking-[0.25em] text-[#e6c96a] transition-colors hover:bg-[#d4af37] hover:text-black"
            >
              Begin the consultation
            </Link>
            <Link
              href="/discovery-set"
              className="inline-flex min-h-12 items-center text-xs uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white"
            >
              The Discovery Set · Concept →
            </Link>
          </div>
        </Reveal>
      </section>
      <Footer />
    </main>
  );
}
