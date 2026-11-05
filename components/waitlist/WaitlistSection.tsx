import Link from "next/link";

import Reveal from "@/components/motion/Reveal";
import type { FragrancePreference } from "@/lib/waitlist/constants";
import { cn } from "@/lib/utils";

import WaitlistForm from "./WaitlistForm";

interface WaitlistSectionProps {
  /** Anchor id so other pages can link straight to the form. */
  id?: string;
  eyebrow?: string;
  heading: React.ReactNode;
  body?: React.ReactNode;
  /** Pre-selects a fragrance, e.g. on that fragrance's own page. */
  defaultFragrance?: FragrancePreference;
  /** Whether the waitlist accepts sign-ups, when the caller knows. Omit on static pages. */
  available?: boolean;
  /** Draw the top rule used between full-width page sections. */
  bordered?: boolean;
  className?: string;
}

/**
 * Waitlist invitation: copy on one side, the form on the other. Used on the
 * homepage, collection, fragrance pages, the Discovery Set and /waitlist, so
 * the offer and its wording stay identical everywhere.
 */
export default function WaitlistSection({
  id,
  eyebrow = "The waitlist",
  heading,
  body = "Discover the world of SOLSTICE before its first release. Join our list for fragrance development updates and launch announcements.",
  defaultFragrance,
  available,
  bordered = true,
  className,
}: WaitlistSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={cn(
        "scroll-mt-20 py-24 md:py-36",
        bordered && "border-t border-white/10",
        className
      )}
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-24">
        <Reveal className="min-w-0">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            {eyebrow}
          </p>
          <h2
            id={id ? `${id}-heading` : undefined}
            className="font-display text-4xl leading-tight md:text-6xl"
          >
            {heading}
          </h2>
          <p className="mt-7 max-w-md text-sm leading-8 text-white/65 md:text-base">
            {body}
          </p>
          <ul className="mt-8 max-w-md space-y-3 text-sm leading-7 text-white/55">
            <li>Updates on how the fragrances are developing.</li>
            <li>An announcement when there is something to announce.</li>
            <li>Unsubscribe from any email, any time.</li>
          </ul>
          <Link
            href="/privacy"
            className="mt-3 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
          >
            How we handle your data →
          </Link>
          <p className="mt-5 max-w-md text-xs leading-6 text-white/40">
            SOLSTICE fragrances are concepts in development and are not yet available to
            purchase. Joining the list does not reserve anything.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="min-w-0">
          <WaitlistForm defaultFragrance={defaultFragrance} available={available} />
        </Reveal>
      </div>
    </section>
  );
}
