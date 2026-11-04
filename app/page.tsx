import Link from "next/link";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

const fragrances = [
  { name: "AURORA", number: "01", mood: "THE ELECTRIC AWAKENING", notes: "Icy eucalyptus · Green apple · Ozonic musk · Frozen pine", color: "aurora", image: "/images/fragrances/aurora.png", description: "A current of luminous freshness across the polar night." },
  { name: "ECLIPSE", number: "02", mood: "THE BEAUTY OF SHADOW", notes: "Smoked oud · Black pepper · Aged leather · Amber resins", color: "eclipse", image: "/images/fragrances/eclipse.png", description: "The moment light disappears, and something extraordinary begins." },
  { name: "CORONA", number: "03", mood: "THE GOLDEN HOUR", notes: "Solar bergamot · Golden honey · Saffron · Warm amber", color: "corona", image: "/images/fragrances/corona.png", description: "An incandescent warmth that lingers long after sunset." },
  { name: "NOCTURNE", number: "04", mood: "THE ART OF STILLNESS", notes: "Cashmere wood · Dark plum · Night-blooming jasmine · Vanilla bean", color: "nocturne", image: "/images/fragrances/nocturne.png", description: "A quiet constellation of depth, softness and intrigue." },
] as const;

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />
      <Hero />
      <section id="collection" className="mx-auto max-w-7xl px-6 py-24 md:py-36">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="mb-5 text-xs uppercase tracking-[0.35em] text-[#d4af37]">01 / The collection</p>
            <h2 className="font-display text-5xl leading-tight md:text-7xl">Four expressions.<br /><span className="italic text-[#d4af37]">One source of light.</span></h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-white/55">Each fragrance captures an atmospheric phenomenon, translating the language of light into an intimate sensory experience.</p>
        </div>
        <div className="grid gap-8 md:grid-cols-2">
          {fragrances.map((scent) => (
            <article key={scent.name} className="group overflow-hidden border border-white/10 bg-[#101014] transition-colors hover:border-[#d4af37]/40">
              <Link href={`/fragrances/${scent.name.toLowerCase()}`} aria-label={`Explore ${scent.name}`} className="block">\n              <div className={`relative aspect-[4/3] overflow-hidden bg-[#121216] aura-${scent.color}`}>
                <div
                  role="img"
                  aria-label={`SOLSTICE ${scent.name} perfume bottle and packaging concept`}
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: `url("${scent.image}")` }}
                />
                <span className="absolute left-5 top-5 border border-white/20 bg-black/60 px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-white/85 backdrop-blur-md">No. {scent.number} / Eau de parfum concept</span>
              </div>
              </Link>\n              <div className="p-7 md:p-10">
                <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-[#d4af37]">{scent.mood}</p>
                <h3 className="font-display text-4xl md:text-5xl"><Link href={`/fragrances/${scent.name.toLowerCase()}`} className="hover:text-[#d4af37]">{scent.name}</Link></h3>
                <p className="mt-4 text-sm leading-7 text-white/70">{scent.description}</p>
                <div className="mt-7 border-t border-white/10 pt-5">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/45">The fragrance notes</p>
                  <p className="text-xs leading-7 text-white/70">{scent.notes}</p>\n                  <Link href={`/fragrances/${scent.name.toLowerCase()}`} className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-[#d4af37] hover:text-white">Discover fragrance →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section id="philosophy" className="border-y border-white/10 px-6 py-28 text-center md:py-40">
        <p className="mb-8 text-xs uppercase tracking-[0.35em] text-[#d4af37]">02 / Our philosophy</p>
        <h2 className="mx-auto max-w-4xl font-display text-4xl leading-tight md:text-7xl">Light is fleeting.<br /><span className="italic text-white/55">Its impression is eternal.</span></h2>
        <p className="mx-auto mt-9 max-w-xl text-sm leading-8 text-white/55">A study in contrast: warmth and cold, radiance and shadow, the visible and the invisible. SOLSTICE transforms the phenomena above us into the stories we carry with us.</p>
      </section>
      <section id="discover" className="mx-auto max-w-5xl px-6 py-28 text-center md:py-40">
        <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">03 / Find your light</p>
        <h2 className="font-display text-5xl md:text-7xl">Your atmosphere.<br /><span className="italic">Your signature.</span></h2>
        <p className="mx-auto mt-8 max-w-lg text-sm leading-8 text-white/55">Four distinct worlds. One personal connection. Discover the scent that reflects your own light.</p>
        <a href="#collection" className="mt-10 inline-block border border-[#d4af37]/60 px-9 py-4 text-xs uppercase tracking-[0.25em] text-[#e6c96a] transition-colors hover:bg-[#d4af37] hover:text-black">Explore the collection</a>
      </section>
      <Footer />
    </main>
  );
}
