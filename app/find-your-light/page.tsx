import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import FindYourLight from "@/components/quiz/FindYourLight";

export const metadata: Metadata = {
  title: "Find Your Light",
  description:
    "A private consultation in five questions. Discover which SOLSTICE atmosphere — Aurora, Eclipse, Corona or Nocturne — reflects your own light.",
};

export default function FindYourLightPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-[#f5f0e8]">
      <Navbar />
      <FindYourLight />
      <Footer />
    </main>
  );
}
