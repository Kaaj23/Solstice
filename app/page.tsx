import Image from "next/image";
import Link from "next/link";

import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ImageReveal from "@/components/motion/ImageReveal";
import Reveal from "@/components/motion/Reveal";
import { fragrances } from "@/data/fragrances";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]";

/** The four movements of the philosophy. Original copy; no claims about the house's history. */
const movements = [
  {
    title: "Light",
    text: "The cold blue before dawn, the long gold of late afternoon, the dark that follows. Light is the first thing we notice and the last thing we explain.",
  },
  {
    title: "Atmosphere",
    text: "Light changes how a place feels long before we know why. SOLSTICE begins with that change in the air.",
  },
  {
    title: "Memory",
    text: "We rarely remember light exactly. We remember what it made us feel, and where we were when it did.",
  },
  {
    title: "Scent",
    text: "Fragrance can carry that feeling with us. Each concept is an attempt to give one moment of light a scent.",
  },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />
      <Hero />

      {/* ------------------------------------------------------------ collection */}
      <section
        id="collection"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 md:py-36"
      >
        <Reveal className="mb-14 flex flex-col justify-between gap-8 md:mb-20 md:flex-row md:items-end">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
              01 / The collection
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl md:text-7xl">
              Four expressions.
              <br />
              <span className="italic text-[#d4af37]">One source of light.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/60">
            Each fragrance captures an atmospheric phenomenon, translating the language of
            light into an intimate sensory experience.
          </p>
        </Reveal>

        <div className="grid gap-8 md:grid-cols-2">
          {fragrances.map((fragrance, index) => (
            <Reveal key={fragrance.slug} delay={(index % 2) * 0.12} className="h-full">
              <article className="group relative h-full overflow-hidden border border-white/10 bg-[#101014]">
                {/* Hover / focus: a soft wash of this fragrance's own light and a hairline in its colour. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-700 group-focus-within:opacity-100 group-hover:opacity-100"
                  style={{
                    boxShadow: `inset 0 0 0 1px ${fragrance.accent}66`,
                    background: `radial-gradient(ellipse 80% 45% at 50% 0%, ${fragrance.accent}1f, transparent 70%)`,
                  }}
                />
                {/* Decorative duplicate of the heading link below: kept out of the tab order. */}
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
                        className="duration-1000 object-cover transition-transform ease-out motion-safe:group-hover:scale-[1.025]"
                      />
                    </ImageReveal>
                    <span className="absolute left-5 top-5 border border-white/20 bg-black/60 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">
                      No. {fragrance.number} · Fragrance concept
                    </span>
                  </div>
                </Link>
                <div className="relative p-7 md:p-10">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#d4af37]">
                    {fragrance.mood}
                  </p>
                  <h3 className="font-display text-4xl lg:text-5xl">
                    <Link
                      href={`/fragrances/${fragrance.slug}`}
                      className={`transition-colors duration-300 hover:text-[#d4af37] ${focusRing}`}
                    >
                      {fragrance.name}
                    </Link>
                  </h3>
                  <p className="mt-2 font-display text-lg italic text-white/55">
                    {fragrance.subtitle}
                  </p>
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
                    <Link
                      href={`/fragrances/${fragrance.slug}`}
                      className={`mt-6 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors duration-300 hover:text-white ${focusRing}`}
                    >
                      Discover {fragrance.name} →
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ philosophy */}
      <section
        id="philosophy"
        className="scroll-mt-20 border-y border-white/10 py-28 md:py-40"
      >
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="text-center">
            <p className="mb-8 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
              02 / Our philosophy
            </p>
            <h2 className="mx-auto max-w-4xl font-display text-[clamp(2.1rem,8vw,4.75rem)] leading-[1.08] tracking-tight">
              <span aria-hidden="true" className="text-[#d4af37]">
                “
              </span>
              Light is more than what we see.
              <br />
              <span className="italic text-white/55">It shapes what we feel.</span>
              <span aria-hidden="true" className="text-[#d4af37]">
                ”
              </span>
            </h2>
          </Reveal>

          <ol className="mt-20 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:mt-28 xl:grid-cols-4">
            {movements.map((movement, index) => (
              <li key={movement.title} className="bg-[#050505]">
                <Reveal delay={index * 0.1} className="h-full p-8 md:p-10">
                  <p className="font-mono text-[11px] text-[#d4af37]">0{index + 1}</p>
                  <h3 className="mt-10 font-display text-3xl md:mt-14">
                    {movement.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-white/60">{movement.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ journey */}
      <section
        id="discover"
        className="mx-auto max-w-7xl scroll-mt-20 px-6 py-24 md:py-36"
      >
        <Reveal className="mb-14 max-w-3xl md:mb-20">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            03 / Begin the journey
          </p>
          <h2 className="font-display text-5xl leading-tight md:text-7xl">
            Your atmosphere.
            <br />
            <span className="italic">Your signature.</span>
          </h2>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Find Your Light */}
          <Reveal className="h-full">
            <div className="flex h-full flex-col border border-white/10 bg-[#0b0b0e]">
              <div
                aria-hidden="true"
                className="relative flex h-56 items-center justify-center overflow-hidden border-b border-white/10 md:h-72"
              >
                {fragrances.map((fragrance, index) => (
                  <div
                    key={fragrance.slug}
                    className="absolute h-44 w-44 rounded-full blur-2xl md:h-56 md:w-56"
                    style={{
                      background: `radial-gradient(circle, ${fragrance.accent}66, transparent 68%)`,
                      transform: `translateX(${(index - 1.5) * 34}%)`,
                    }}
                  />
                ))}
                <div className="relative flex gap-2">
                  {[0, 1, 2, 3, 4].map((step) => (
                    <span key={step} className="h-px w-8 bg-[#d4af37]/70 md:w-12" />
                  ))}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-8 md:p-10">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[#d4af37]">
                  Find your light
                </p>
                <h3 className="font-display text-3xl leading-tight md:text-4xl">
                  A consultation in five questions.
                </h3>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                  Choose the atmospheres, feelings and settings you are drawn to. We will
                  point you to the SOLSTICE fragrance whose light is closest to yours, and
                  show you exactly how we arrived at it.
                </p>
                <Link
                  href="/find-your-light"
                  className={`mt-9 inline-flex min-h-12 items-center self-start border border-[#d4af37]/60 px-9 text-xs uppercase tracking-[0.25em] text-[#e6c96a] transition-colors hover:bg-[#d4af37] hover:text-black ${focusRing}`}
                >
                  Begin the consultation
                </Link>
              </div>
            </div>
          </Reveal>

          {/* Discovery Set (concept) */}
          <Reveal delay={0.12} className="h-full">
            <div className="flex h-full flex-col border border-white/10 bg-[#0b0b0e]">
              <div
                aria-hidden="true"
                className="grid grid-cols-2 gap-px border-b border-white/10 bg-white/10"
              >
                {fragrances.map((fragrance) => (
                  <div
                    key={fragrance.slug}
                    className={`relative aspect-[3/2] overflow-hidden bg-[#121216] aura-${fragrance.slug}`}
                  >
                    <Image
                      src={fragrance.image}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-1 flex-col p-8 md:p-10">
                <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-[#d4af37]">
                  The Discovery Set · Concept in development
                </p>
                <h3 className="font-display text-3xl leading-tight md:text-4xl">
                  Four atmospheres, side by side.
                </h3>
                <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
                  An imagined way to meet the whole house at once, so the differences
                  between Aurora, Eclipse, Corona and Nocturne can be felt rather than
                  read about.
                </p>
                <Link
                  href="/discovery-set"
                  className={`mt-9 inline-flex min-h-12 items-center self-start text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white ${focusRing}`}
                >
                  Explore the concept →
                </Link>
                <p className="mt-auto pt-8 text-[10px] uppercase tracking-[0.18em] text-[#d4af37]/80">
                  Concept only · Not yet available to purchase
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
