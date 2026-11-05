import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import WaitlistForm from "@/components/waitlist/WaitlistForm";
import { siteConfig } from "@/config/site";
import { isFragrancePreference } from "@/lib/waitlist/validation";
import { getWaitlistRuntime } from "@/lib/waitlist/runtime";

// Whether the waitlist is configured is only known when a request arrives.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Discover the world of SOLSTICE before its first release. Join our list for fragrance development updates and launch announcements.",
  alternates: { canonical: "/waitlist" },
  openGraph: {
    title: "Be first to experience the light. | SOLSTICE",
    description:
      "Join the SOLSTICE list for fragrance development updates and launch announcements.",
    url: "/waitlist",
    type: "website",
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: siteConfig.name }],
  },
};

interface WaitlistPageProps {
  searchParams: Promise<{ fragrance?: string | string[] }>;
}

export default async function WaitlistPage({ searchParams }: WaitlistPageProps) {
  const { fragrance } = await searchParams;
  const requested = Array.isArray(fragrance) ? fragrance[0] : fragrance;
  const defaultFragrance =
    requested && isFragrancePreference(requested) ? requested : "all";
  const available = getWaitlistRuntime().available;

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />

      <section className="relative overflow-hidden pb-24 pt-36 md:pb-36 md:pt-48">
        <div
          aria-hidden="true"
          className="hero-atmosphere pointer-events-none absolute inset-0"
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
          <div className="min-w-0">
            <p className="rise-in mb-8 text-[10px] uppercase tracking-[0.4em] text-[#e2c979] md:text-xs">
              The waitlist · Concepts in development
            </p>
            <h1
              className="rise-in font-display text-[clamp(2.5rem,9vw,6.5rem)] leading-[0.95] tracking-[-0.04em]"
              style={{ animationDelay: "120ms" }}
            >
              Be first to experience{" "}
              <span className="italic text-[#d4af37]">the light.</span>
            </h1>
            <p
              className="rise-in mt-9 max-w-md text-sm leading-8 text-white/65 md:text-base"
              style={{ animationDelay: "260ms" }}
            >
              Discover the world of SOLSTICE before its first release. Join our list for
              fragrance development updates and launch announcements.
            </p>

            <ul
              className="rise-in mt-9 max-w-md space-y-3 text-sm leading-7 text-white/55"
              style={{ animationDelay: "380ms" }}
            >
              <li>Updates on how the four fragrances are developing.</li>
              <li>An announcement when there is something to announce.</li>
              <li>Nothing else, and you can unsubscribe from any email.</li>
            </ul>

            <p
              className="rise-in mt-9 max-w-md text-xs leading-6 text-white/40"
              style={{ animationDelay: "480ms" }}
            >
              SOLSTICE fragrances are concepts in development and are not yet available to
              purchase. Joining the list does not reserve anything.
            </p>
            <Link
              href="/privacy"
              className="rise-in mt-3 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
              style={{ animationDelay: "520ms" }}
            >
              How we handle your data →
            </Link>
          </div>

          <div className="rise-in min-w-0" style={{ animationDelay: "300ms" }}>
            <WaitlistForm defaultFragrance={defaultFragrance} available={available} />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
