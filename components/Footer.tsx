export default function Footer() {
  return <footer className="border-t border-white/10 bg-[#080808] px-6 py-12">
    <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row md:items-end">
      <div><a href="#" className="text-xl tracking-[0.3em] text-[#e8d6a4]">SOLSTICE</a><p className="mt-3 font-display italic text-white/60">Scents Defined by Light.</p></div>
      <div className="text-xs leading-7 text-white/45"><p>© {new Date().getFullYear()} SOLSTICE. All rights reserved.</p><p>Fragrance concepts in development.</p></div>
    </div>
  </footer>;
}
