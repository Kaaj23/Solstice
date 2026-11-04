export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 pb-20 pt-32 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hero-atmosphere" />
      <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[44%] h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d4af37]/20 shadow-[0_0_110px_25px_rgba(212,175,55,0.08)] md:h-[520px] md:w-[520px]" />
      <div className="relative z-10 mx-auto max-w-5xl">
        <p className="mb-9 text-[10px] uppercase tracking-[0.45em] text-[#e2c979] md:text-xs">An exploration of the extraordinary</p>
        <h1 className="font-display text-[clamp(4.2rem,13vw,11rem)] font-normal leading-[0.92] tracking-[-0.055em]">SOLSTICE</h1>
        <p className="mt-7 font-display text-2xl italic text-[#e6d9bb] md:text-4xl">Scents Defined by Light.</p>
        <p className="mx-auto mt-9 max-w-lg text-sm leading-8 text-white/60 md:text-base">Where the phenomena of light become the art of fragrance. Four worlds. Four atmospheres. An entirely new way to experience scent.</p>
        <a href="#collection" className="mt-11 inline-block border border-[#d4af37]/70 bg-black/30 px-10 py-4 text-[11px] uppercase tracking-[0.25em] text-[#e9d6a0] transition-all hover:bg-[#d4af37] hover:text-black">Enter the collection</a>
      </div>
      <a href="#collection" className="absolute bottom-9 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.35em] text-white/45">Scroll to discover ↓</a>
    </section>
  );
}
