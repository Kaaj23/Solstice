import Link from "next/link";

import { siteConfig } from "@/config/site";
import { fragrances } from "@/data/fragrances";

const linkClass =
  "inline-flex min-h-11 items-center text-sm text-white/60 transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]";

const headingClass = "text-[10px] uppercase tracking-[0.3em] text-[#d4af37]";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080808] pb-10 pt-16 md:pt-20">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center font-display text-2xl tracking-[0.3em] text-[#e8d6a4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
          >
            SOLSTICE
          </Link>
          <p className="mt-2 font-display text-lg italic text-white/65">
            {siteConfig.tagline}
          </p>
          <p className="mt-6 max-w-xs text-xs leading-6 text-white/45">
            Four fragrance concepts inspired by light. Still in development and not yet
            available to purchase.
          </p>
        </div>

        <nav aria-label="Footer: the collection">
          <p className={headingClass}>The collection</p>
          <ul className="mt-3">
            {fragrances.map((fragrance) => (
              <li key={fragrance.slug}>
                <Link href={`/fragrances/${fragrance.slug}`} className={linkClass}>
                  {fragrance.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Footer: explore">
          <p className={headingClass}>Explore</p>
          <ul className="mt-3">
            {siteConfig.nav.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mx-auto mt-14 flex max-w-7xl flex-col gap-2 border-t border-white/10 px-6 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} SOLSTICE</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em]">
          Scents defined by light
        </p>
      </div>
    </footer>
  );
}
