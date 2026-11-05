"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const focusRing =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // A route change always closes the mobile menu.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Only real routes can be "the current page"; `/#section` links cannot.
  const isCurrent = (href: string) => !href.includes("#") && pathname === href;

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050505]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          aria-label="SOLSTICE home"
          className={cn(
            "inline-flex min-h-11 items-center text-xl font-semibold tracking-[0.3em] text-[#e8d6a4]",
            focusRing
          )}
        >
          SOLSTICE
        </Link>

        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-7 text-[11px] uppercase tracking-[0.2em] text-white/70 lg:flex"
        >
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              className={cn(
                "py-2 transition-colors hover:text-white",
                isCurrent(link.href) && "text-[#e8d6a4]",
                focusRing
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/waitlist"
          aria-current={isCurrent("/waitlist") ? "page" : undefined}
          className={cn(
            "hidden border border-[#d4af37]/60 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#e8d6a4] transition-colors hover:bg-[#d4af37] hover:text-black xl:block",
            focusRing
          )}
        >
          Join the waitlist
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          onClick={() => setOpen(!open)}
          className={cn(
            "min-h-11 min-w-[4.5rem] border border-white/20 px-4 text-xs uppercase tracking-widest lg:hidden",
            focusRing
          )}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="flex flex-col border-t border-white/10 bg-[#090909] px-6 py-3 text-xs uppercase tracking-[0.2em] lg:hidden"
        >
          {siteConfig.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-12 items-center text-white/80 transition-colors hover:text-white",
                isCurrent(link.href) && "text-[#e8d6a4]",
                focusRing
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/waitlist"
            aria-current={isCurrent("/waitlist") ? "page" : undefined}
            onClick={() => setOpen(false)}
            className={cn(
              "my-3 flex min-h-12 items-center justify-center border border-[#d4af37]/60 text-[#e8d6a4] transition-colors hover:bg-[#d4af37] hover:text-black",
              focusRing
            )}
          >
            Join the waitlist
          </Link>
        </nav>
      )}
    </header>
  );
}
