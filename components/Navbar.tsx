"use client";

import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <a href="#" aria-label="SOLSTICE home" className="text-xl font-semibold tracking-[0.3em] text-[#e8d6a4]">SOLSTICE</a>
        <nav aria-label="Main navigation" className="hidden items-center gap-9 text-[11px] uppercase tracking-[0.2em] text-white/70 md:flex">
          <a className="hover:text-white" href="#collection">The collection</a>
          <a className="hover:text-white" href="#philosophy">Our philosophy</a>
          <a className="hover:text-white" href="#discover">Find your light</a>
        </nav>
        <a href="#collection" className="hidden border border-[#d4af37]/60 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#e8d6a4] transition-colors hover:bg-[#d4af37] hover:text-black md:block">Explore</a>
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} className="border border-white/20 px-4 py-2 text-xs uppercase tracking-widest md:hidden">{open ? "Close" : "Menu"}</button>
      </div>
      {open && <nav id="mobile-navigation" aria-label="Mobile navigation" className="flex flex-col gap-5 border-t border-white/10 bg-[#090909] px-6 py-7 text-xs uppercase tracking-[0.2em] md:hidden">
        <a href="#collection" onClick={() => setOpen(false)}>The collection</a>
        <a href="#philosophy" onClick={() => setOpen(false)}>Our philosophy</a>
        <a href="#discover" onClick={() => setOpen(false)}>Find your light</a>
      </nav>}
    </header>
  );
}
