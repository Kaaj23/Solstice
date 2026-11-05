import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import TokenActionForm, { InvalidLink } from "@/components/waitlist/TokenActionForm";
import { WaitlistUnavailable } from "@/components/waitlist/WaitlistForm";
import { getWaitlistRuntime } from "@/lib/waitlist/runtime";
import { verifyToken } from "@/lib/waitlist/tokens";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

interface UnsubscribePageProps {
  searchParams: Promise<{ token?: string | string[] }>;
}

export default async function UnsubscribePage({ searchParams }: UnsubscribePageProps) {
  const { token: raw } = await searchParams;
  const token = Array.isArray(raw) ? raw[0] : raw;
  const waitlist = getWaitlistRuntime();

  let body: React.ReactNode;
  if (!waitlist.available) {
    body = <WaitlistUnavailable />;
  } else if (
    !token ||
    !verifyToken(waitlist.deps.tokenSecret, token, "unsub", Math.floor(Date.now() / 1000))
      .ok
  ) {
    body = <InvalidLink />;
  } else {
    body = <TokenActionForm mode="unsubscribe" token={token} />;
  }

  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />
      <section className="px-6 pb-24 pt-36 md:pb-36 md:pt-48">
        <div className="mx-auto max-w-xl">
          <p className="mb-6 text-xs uppercase tracking-[0.35em] text-[#d4af37]">
            The waitlist
          </p>
          <h1 className="font-display text-4xl leading-tight md:text-6xl">
            Leave the <span className="italic text-[#d4af37]">list.</span>
          </h1>
          <p className="mt-6 text-sm leading-8 text-white/65 md:text-base">
            Press the button to stop receiving SOLSTICE emails. You can also ask us to
            delete your data entirely.
          </p>
          <div className="mt-10">{body}</div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
