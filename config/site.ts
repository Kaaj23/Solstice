/**
 * Central site configuration for SOLSTICE.
 *
 * Consumed by `app/layout.tsx` for metadata and, in later phases, by
 * navigation, footer, and SEO components. Keep this the single source of
 * truth for brand copy that appears in more than one place.
 */

export const siteConfig = {
  name: "SOLSTICE",
  tagline: "High Parfumerie Refracted Through Light.",
  description:
    "SOLSTICE is a luxury niche fragrance house and architectural review platform where every scent is defined by an atmospheric light phenomenon — Aurora, Eclipse, Corona, and Nocturne.",
  url: "https://solstice.com",
  ogImage: "/images/og-solstice.jpg",
  locale: "en-US",
  themeColor: "#050505",

  keywords: [
    "niche fragrance",
    "luxury perfume",
    "fragrance reviews",
    "perfume house",
    "SOLSTICE",
    "high parfumerie",
    "designer fragrance",
  ],

  creator: {
    name: "SOLSTICE",
    twitter: "@solstice",
  },

  links: {
    twitter: "https://twitter.com/solstice",
    instagram: "https://instagram.com/solstice",
    tiktok: "https://tiktok.com/@solstice",
  },

  /**
   * Brand palette mirrored from `tailwind.config.ts` for contexts that
   * need raw hex values (metadata theme-color, email templates, canvas /
   * SVG generation) rather than Tailwind utility classes.
   */
  palette: {
    midnight: "#050505",
    obsidian: "#121216",
    gold: "#D4AF37",
  },
} as const;

export type SiteConfig = typeof siteConfig;
