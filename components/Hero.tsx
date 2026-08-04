export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-block px-4 py-1.5 rounded-full glass-panel text-xs font-semibold tracking-widest uppercase text-amber-400 border-amber-500/30">
          Curated Luxury Fragrance Intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
          Deciphering the Art of <br />
          <span className="text-gold-gradient">Haute Parfumerie</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
          Elevated fragrance reviews, olfactory breakdown analytics, and AI-driven scent matching designed for the modern connoisseur.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="#reviews"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-amber-500 text-black font-semibold text-sm tracking-wide uppercase gold-glow hover:bg-amber-400 transition-all"
          >
            Discover Reviews
          </a>
          <a
            href="#finder"
            className="w-full sm:w-auto px-8 py-4 rounded-full glass-panel text-white font-semibold text-sm tracking-wide uppercase hover:bg-white/10 transition-all"
          >
            AI Scent Finder
          </a>
        </div>
      </div>
    </section>
  );
}
