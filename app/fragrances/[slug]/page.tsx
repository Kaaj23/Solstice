import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";
import { fragrances } from "../../../data/fragrances";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return fragrances.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fragrance = fragrances.find((item) => item.slug === slug);
  if (!fragrance) return { title: "Fragrance not found" };
  return { title: fragrance.name, description: fragrance.description };
}

export default async function FragrancePage({ params }: Props) {
  const { slug } = await params;
  const fragrance = fragrances.find((item) => item.slug === slug);
  if (!fragrance) notFound();
  const others = fragrances.filter((item) => item.slug !== slug);
  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />
      <section className="mx-auto max-w-7xl px-6 pb-24 pt-32 md:pb-36 md:pt-40">
        <Link href="/#collection" className="inline-flex text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors hover:text-white">← Back to collection</Link>
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className={`relative aspect-[4/3] overflow-hidden border border-white/10 bg-gradient-to-br ${fragrance.palette} bg-[#101014]`}>
            <Image src={fragrance.image} alt={`SOLSTICE ${fragrance.name} bottle and packaging concept`} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
          </div>
          <div>
            <p className="mb-6 text-xs uppercase tracking-[0.3em] text-[#d4af37]">No. {fragrance.number} / Eau de Parfum · Concept</p>
            <h1 className="font-display text-6xl tracking-tight md:text-8xl">{fragrance.name}</h1>
            <p className="mt-5 font-display text-2xl italic text-[#e2c979] md:text-3xl">{fragrance.subtitle}</p>
            <p className="mt-8 max-w-xl text-base leading-8 text-white/65">{fragrance.description}</p>
            <div className="mt-10 border-t border-white/15 pt-8">
              <p className="mb-5 text-xs uppercase tracking-[0.25em] text-white/45">The olfactory palette</p>
              <div className="flex flex-wrap gap-3">{fragrance.notes.map((note) => <span key={note} className="border border-white/15 px-4 py-3 text-xs tracking-wide text-white/80">{note}</span>)}</div>
            </div>
            <p className="mt-9 text-xs uppercase tracking-[0.18em] text-[#d4af37]">Fragrance concept in development · Not yet available to purchase</p>
          </div>
        </div>
      </section>
      <section className="border-y border-white/10 px-6 py-24 md:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-7 text-xs uppercase tracking-[0.3em] text-[#d4af37]">The story behind the light</p>
          <h2 className="font-display text-4xl md:text-6xl">{fragrance.mood}</h2>
          <p className="mt-9 text-base leading-9 text-white/65">{fragrance.story}</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <h2 className="font-display text-4xl md:text-5xl">Explore other atmospheres</h2>
          <Link href="/#collection" className="text-xs uppercase tracking-[0.2em] text-[#d4af37] hover:text-white">View the collection →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {others.map((item) => <Link key={item.slug} href={`/fragrances/${item.slug}`} className="group border border-white/10 bg-[#101014] transition-colors hover:border-[#d4af37]/50">
            <div className="relative aspect-[4/3] overflow-hidden"><Image src={item.image} alt={`${item.name} bottle and packaging`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" /></div>
            <div className="p-6"><p className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37]">{item.subtitle}</p><h3 className="mt-2 font-display text-3xl">{item.name}</h3></div>
          </Link>)}
        </div>
      </section>
      <Footer />
    </main>
  );
}
