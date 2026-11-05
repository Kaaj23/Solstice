import type { Metadata } from "next";
import Link from "next/link";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { CONSENT_VERSION, PENDING_RETENTION_DAYS } from "@/lib/waitlist/constants";

// The optional contact address comes from the environment at request time.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "What the SOLSTICE waitlist collects, why, who processes it, how long it is kept, and how to unsubscribe or have your data deleted.",
  alternates: { canonical: "/privacy" },
};

const link =
  "text-[#e2c979] underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]";

export default function PrivacyPage() {
  const contact = process.env.WAITLIST_PRIVACY_CONTACT?.trim();

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />
      <section className="px-6 pb-24 pt-36 md:pb-36 md:pt-48">
        <div className="mx-auto max-w-2xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            Privacy notice
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-6xl">
            How we handle <span className="italic text-[#d4af37]">your data.</span>
          </h1>
          <p className="mt-6 text-sm leading-8 text-white/65 md:text-base">
            This notice covers the SOLSTICE waitlist. Browsing this website does not
            require you to give us any personal information.
          </p>

          <div className="mt-14 space-y-12 text-sm leading-8 text-white/70 md:text-base md:leading-9">
            <div>
              <h2 className="font-display text-2xl text-[#f5f0e8] md:text-3xl">
                What we collect
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#d4af37]">
                <li>Your email address, which you give us when you join.</li>
                <li>
                  Your optional fragrance preference (Aurora, Eclipse, Corona, Nocturne or
                  all).
                </li>
                <li>
                  A record of your consent: that you ticked the box, when, and which
                  version of the consent wording you saw (version {CONSENT_VERSION}).
                </li>
                <li>
                  When you signed up, when we sent your confirmation email, and when you
                  confirmed or unsubscribed.
                </li>
              </ul>
              <p className="mt-4">
                To limit abuse we also use your IP address and email address briefly to
                count sign-up attempts. We do not store them for that purpose: they are
                turned into one-way keyed hashes, and those counters are deleted within a
                day.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#f5f0e8] md:text-3xl">
                Why, and on what basis
              </h2>
              <p className="mt-4">
                We use your email address only to send SOLSTICE fragrance development
                updates and launch announcements. We do so because you asked us to and
                agreed to it (consent). Nothing is sent to you until you confirm your
                address using the link in our confirmation email. We do not sell your data
                or use it for anything else.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#f5f0e8] md:text-3xl">
                Who handles it for us
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#d4af37]">
                <li>Supabase hosts the database that stores the waitlist.</li>
                <li>Resend delivers our emails to you.</li>
                <li>Vercel hosts this website.</li>
              </ul>
              <p className="mt-4">
                These providers process data on our behalf and may do so outside your
                country.
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#f5f0e8] md:text-3xl">
                How long we keep it
              </h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 marker:text-[#d4af37]">
                <li>
                  If you never confirm, we delete your address after{" "}
                  {PENDING_RETENTION_DAYS} days.
                </li>
                <li>If you confirm, we keep it until you unsubscribe.</li>
                <li>
                  If you unsubscribe, we keep your address, marked as unsubscribed, so
                  that we can honour your choice and not email you again. You can ask us
                  to delete it completely at the same time (see below).
                </li>
                <li>
                  We keep a small activity log (for example &ldquo;confirmed&rdquo;) that
                  does not contain your email address.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#f5f0e8] md:text-3xl">
                Your choices
              </h2>
              <p className="mt-4">
                Every email we send contains an unsubscribe link, and email apps that
                support it show an unsubscribe button. The unsubscribe page also lets you
                delete your data permanently with one tick. If you have questions about
                your data or want help,{" "}
                {contact ? (
                  <>
                    contact us at{" "}
                    {contact.includes("@") ? (
                      <a href={`mailto:${contact}`} className={link}>
                        {contact}
                      </a>
                    ) : (
                      contact
                    )}
                    .
                  </>
                ) : (
                  <>use the unsubscribe link in any email we have sent you.</>
                )}
              </p>
            </div>

            <div>
              <h2 className="font-display text-2xl text-[#f5f0e8] md:text-3xl">
                Concept in development
              </h2>
              <p className="mt-4">
                SOLSTICE fragrances are concepts in development and are not yet available
                to purchase. Joining the waitlist does not reserve a product, a price or a
                release.
              </p>
              <Link
                href="/waitlist"
                className="mt-4 inline-flex min-h-11 items-center text-xs uppercase tracking-[0.2em] text-[#d4af37] transition-colors hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#d4af37]"
              >
                Join the waitlist →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
