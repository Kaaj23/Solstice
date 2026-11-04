import Link from "next/link";

import { siteConfig } from "@/config/site";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080808] px-6 py-12">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-10 lg:flex-row lg:items-end">
        <div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-xl tracking-[0.3em] text-[#e8d6a4]"
          >
            SOLSTICE
          </Link>
          <p className="mt-3 font-display italic text-white/60">{siteConfig.tagline}</p>
        </div>
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-7 text-[11px] uppercase tracking-[0.2em] text-white/55"
        >
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="text-xs leading-7 text-white/45">
          <p>© {new Date().getFullYear()} SOLSTICE. All rights reserved.</p>
          <p>Fragrance concepts in development.</p>
        </div>
      </div>
    </footer>
  );
}
