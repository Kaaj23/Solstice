import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Footer from "@/components/Footer";
import LightScene from "@/components/LightScene";
import Navbar from "@/components/Navbar";
import ImageReveal from "@/components/motion/ImageReveal";
import ParallaxImage from "@/components/motion/ParallaxImage";
import Reveal from "@/components/motion/Reveal";
import WaitlistSection from "@/components/waitlist/WaitlistSection";
import { fragrances } from "@/data/fragrances";
import { isFragrancePreference } from "@/lib/waitlist/validation";

type Props = { params: Promise<{ slug: string }> };

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]";

export function generateStaticParams() {
  return fragrances.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fragrance = fragrances.find((item) => item.slug === slug);
  if (!fragrance) return { title: "Fragrance not found" };
  return {
    title: `${fragrance.name} — ${fragrance.subtitle}`,
    description: fragrance.description,
  };
}

export default async function FragrancePage({ params }: Props) {
  const { slug } = await params;
  const index = fragrances.findIndex((item) => item.slug === slug);
  const fragrance = fragrances[index];
  if (!fragrance) notFound();

  const others = fragrances.filter((item) => item.slug !== slug);
  const previous = fragrances[(index + fragrances.length - 1) % fragrances.length];
  const next = fragrances[(index + 1) % fragrances.length];

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />

      {/* ---------------------------------------------------------------- hero */}
      <div className="relative overflow-hidden">
        {/* Each fragrance carries its own atmosphere behind the introduction. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 opacity-70 aura-${fragrance.slug}`}
        />
        <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-28 md:pb-36 md:pt-36">
          <nav aria-label="Breadcrumb" className="rise-in">
            <ol className="flex flex-wrap items-center gap-x-3 text-[10px] uppercase tracking-[0.25em] text-white/45">
              <li>
                <Link
                  href="/collection"
                  className={`inline-flex min-h-11 items-center text-[#d4af37] transition-colors hover:text-white ${focusRing}`}
                >
                  The collection
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">{fragrance.name}</li>
            </ol>
          </nav>

          <div className="mt-4 grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
            <ParallaxImage
              src={fragrance.image}
              alt={`SOLSTICE ${fragrance.name} bottle and packaging concept`}
              sizes="(max-width: 1024px) 100vw, 55vw"
              priority
              className={`border border-white/10 bg-gradient-to-br ${fragrance.palette} bg-[#101014]`}
            />
            <div className="min-w-0">
              <p
                className="rise-in mb-6 font-mono text-[11px] uppercase tracking-[0.3em] text-[#d4af37]"
                style={{ animationDelay: "100ms" }}
              >
                No. {fragrance.number} · Fragrance concept
              </p>
              <h1
                className="rise-in font-display text-[clamp(2.75rem,13vw,5rem)] leading-none tracking-tight lg:text-[clamp(3.5rem,6vw,6rem)]"
                style={{ animationDelay: "180ms" }}
              >
                {fragrance.name}
              </h1>
              <p
                className="rise-in mt-5 font-display text-2xl italic text-[#e2c979] md:text-3xl"
                style={{ animationDelay: "260ms" }}
              >
                {fragrance.subtitle}
              </p>
              <p
                className="rise-in mt-8 max-w-xl text-base leading-8 text-white/70"
                style={{ animationDelay: "340ms" }}
              >
                {fragrance.description}
              </p>
              <ul
                aria-label="Character"
                className="rise-in mt-8 flex flex-wrap gap-2"
                style={{ animationDelay: "420ms" }}
              >
                {fragrance.character.map((word) => (
                  <li
                    key={word}
                    className="border px-4 py-2 text-[10px] uppercase tracking-[0.22em] text-white/80"
                    style={{ borderColor: `${fragrance.accent}55` }}
                  >
                    {word}
                  </li>
                ))}
              </ul>
              <p
                className="rise-in mt-9 text-xs uppercase tracking-[0.18em] text-[#d4af37]"
                style={{ animationDelay: "500ms" }}
              >
                Fragrance concept in development · Not yet available to purchase
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ----------------------------------------------------- visual storytelling */}
      <section className="border-y border-white/10 py-24 md:py-36">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <LightScene slug={fragrance.slug} className="lg:aspect-[5/4]" />
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
              Visual atmosphere · {fragrance.atmosphere}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mb-7 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              The story behind the light
            </p>
            <h2 className="font-display text-4xl leading-tight md:text-6xl">
              {fragrance.mood}
            </h2>
            <p className="mt-9 max-w-xl text-base leading-9 text-white/65">
              {fragrance.story}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ----------------------------------------------------------------- notes */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <Reveal className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-[#d4af37]">
              The olfactory palette
            </p>
            <h2 className="font-display text-4xl md:text-5xl">Four notes, one light.</h2>
          </div>
        </Reveal>
        <ol className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 xl:grid-cols-4">
          {fragrance.notes.map((note, noteIndex) => (
            <li key={note} className="bg-[#050505]">
              <Reveal delay={noteIndex * 0.08} className="h-full p-8 md:p-10">
                <span
                  aria-hidden="true"
                  className="block h-px w-8"
                  style={{ backgroundColor: fragrance.accent }}
                />
                <p className="mt-8 font-mono text-[11px] text-white/45">
                  0{noteIndex + 1}
                </p>
                <p className="mt-6 font-display text-2xl leading-snug md:text-3xl">
                  {note}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------- waitlist */}
      <WaitlistSection
        id="waitlist"
        eyebrow={`${fragrance.name} · Concept in development`}
        heading={
          <>
            Be first to experience <span className="italic text-[#d4af37]">the light.</span>
          </>
        }
        body={`${fragrance.name} is a fragrance concept in development. Join our list for fragrance development updates and launch announcements.`}
        defaultFragrance={isFragrancePreference(fragrance.slug) ? fragrance.slug : "all"}
      />

      {/* ------------------------------------------------------------- continue */}
      <section className="border-t border-white/10 py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <h2 className="font-display text-4xl md:text-5xl">
                Explore other atmospheres
              </h2>
              <Link
                href="/collection"
                className={`inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors hover:text-white ${focusRing}`}
              >
                View the collection →
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {others.map((item) => (
                <Link
                  key={item.slug}
                  href={`/fragrances/${item.slug}`}
                  className={`group relative block overflow-hidden border border-white/10 bg-[#101014] transition-colors duration-500 hover:border-[color:var(--accent)] ${focusRing}`}
                  style={{ "--accent": `${item.accent}99` } as React.CSSProperties}
                >
                  <div
                    className={`relative aspect-[3/2] overflow-hidden aura-${item.slug}`}
                  >
                    <ImageReveal className="absolute inset-0">
                      <Image
                        src={item.image}
                        alt={`${item.name} bottle and packaging`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="duration-1000 object-cover transition-transform ease-out motion-safe:group-hover:scale-[1.025]"
                      />
                    </ImageReveal>
                  </div>
                  <div className="p-6">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">
                      {item.subtitle}
                    </p>
                    <h3 className="mt-2 font-display text-3xl">{item.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal className="mt-16 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 md:mt-24">
            {[
              { label: "Previous", item: previous },
              { label: "Next", item: next },
            ].map(({ label, item }) =>
              item ? (
                <Link
                  key={label}
                  href={`/fragrances/${item.slug}`}
                  className={`group flex min-h-24 flex-col justify-center bg-[#050505] px-8 py-6 transition-colors hover:bg-[#0b0b0e] ${focusRing}`}
                >
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/45">
                    {label === "Previous" ? "← " : ""}
                    {label} fragrance
                    {label === "Next" ? " →" : ""}
                  </span>
                  <span className="mt-2 font-display text-2xl transition-colors group-hover:text-[#d4af37]">
                    {item.name}
                  </span>
                </Link>
              ) : null
            )}
          </Reveal>

          <Reveal className="mt-16 text-center md:mt-24">
            <p className="font-display text-2xl italic text-white/70 md:text-3xl">
              Not sure which light is yours?
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
              <Link
                href="/find-your-light"
                className={`inline-flex min-h-12 items-center border border-[#d4af37]/60 px-9 text-xs uppercase tracking-[0.25em] text-[#e6c96a] transition-colors hover:bg-[#d4af37] hover:text-black ${focusRing}`}
              >
                Find your light
              </Link>
              <Link
                href="/discovery-set"
                className={`inline-flex min-h-12 items-center px-4 text-xs uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-white ${focusRing}`}
              >
                The Discovery Set · Concept →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
