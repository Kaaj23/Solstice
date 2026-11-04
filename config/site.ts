export const siteConfig = {
  name: "SOLSTICE",
  tagline: "Scents Defined by Light.",
  description: "SOLSTICE is a luxury niche fragrance house inspired by atmospheric light phenomena. Discover Aurora, Eclipse, Corona and Nocturne.",
  url: "https://example.com",
  ogImage: "/images/og-solstice.jpg",
  locale: "en-US",
  themeColor: "#050505",
  keywords: ["SOLSTICE", "luxury fragrance", "niche perfumery", "Aurora", "Eclipse", "Corona", "Nocturne"],
  creator: { name: "SOLSTICE", twitter: "" },
  links: { twitter: "", instagram: "", tiktok: "" },
  palette: { midnight: "#050505", obsidian: "#121216", gold: "#D4AF37" },
  /** Single source for the header, mobile menu and footer navigation. */
  nav: [
    { href: "/", label: "Home" },
    { href: "/#collection", label: "The collection" },
    { href: "/find-your-light", label: "Find your light" },
    { href: "/discovery-set", label: "Discovery set" },
    { href: "/#philosophy", label: "Our philosophy" },
  ],
} as const;
export type SiteConfig = typeof siteConfig;
