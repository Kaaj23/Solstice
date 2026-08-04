"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col justify-between">
      <Navbar />
      <Hero />
      <Footer />
    </main>
  );
}
