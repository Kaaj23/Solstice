# SOLSTICE

**High Parfumerie Refracted Through Light.**

SOLSTICE is a luxury niche fragrance house and architectural review platform
where every scent is defined by an atmospheric light phenomenon — **Aurora**,
**Eclipse**, **Corona**, and **Nocturne**. The visual language (liquid mesh
gradients, glassmorphism, light-refracting surfaces) represents the physical
behavior of light moving through liquid fragrance and glass.

This repository currently contains **Phase 1: Architecture** — the project
foundation only. No pages, sections, or content are built yet.

---

## Stack

| Layer          | Choice                                             |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 15 (App Router, React 19, Turbopack dev)    |
| Language       | TypeScript (strict mode)                            |
| Styling        | Tailwind CSS 3 + CSS variables, `tailwindcss-animate`|
| Components     | shadcn/ui (`new-york` style, Radix primitives)       |
| Motion         | Framer Motion (React) + GSAP / ScrollTrigger (DOM)   |
| Icons          | Lucide React                                         |
| Forms          | React Hook Form + Zod                                |
| Theming        | next-themes (dark-first)                             |
| Analytics      | Vercel Analytics + Speed Insights                    |
| Tooling        | ESLint 9 (flat config) + Prettier (Tailwind plugin)  |

## Typography

Three deliberate roles, loaded via `next/font/google` in `app/layout.tsx`:

- **Display** — `Bodoni Moda`, a high-contrast editorial serif for headlines,
  in the register of the fashion-house world SOLSTICE sits in.
- **Body** — `Manrope`, a clean geometric grotesk for UI and long-form copy.
- **Mono** — `Space Mono`, used sparingly for eyebrows, data readouts, and
  technical/aura labeling — a nod to the brand's "light phenomena as data"
  concept.

## Color system

Defined as HSL CSS variables in `app/globals.css` (consumed by shadcn/ui's
semantic tokens) and mirrored as raw hex in `tailwind.config.ts` /
`config/site.ts`:

- **Deep Midnight Black** `#050505` — base background
- **Obsidian Surface** `#121216` — cards, panels, elevated surfaces
- **Refracted Gold** `#D4AF37` — primary accent, ships as a full 50–900 scale
- Four scent-aura palettes for future brand/review theming:
  - 🟢 **Aurora** — emerald `#39FFC4` / violet `#8B6BFF`
  - 🌑 **Eclipse** — black `#0A0A0C` / ember `#FF5A2D`
  - ☀️ **Corona** — gold `#FFC24B` / amber `#F2872E`
  - 🌌 **Nocturne** — indigo `#382D7A` / twilight `#5B6FE0`

Glassmorphism primitives (`.glass-panel`, `.glass-panel-elevated`) and
per-aura mesh-gradient backgrounds (`bg-aurora-mesh`, `bg-eclipse-mesh`,
`bg-corona-mesh`, `bg-nocturne-mesh`) live in `globals.css` /
`tailwind.config.ts` and are ready for use in later phases.

## Folder structure

```
solstice/
├── app/                     # App Router — root layout + global styles only
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                  # shadcn/ui primitives (added via `shadcn add`)
│   ├── layout/               # header, footer, nav — Phase 2+
│   ├── home/                  # homepage sections — Phase 2+
│   ├── review/               # review-page components — Phase 3+
│   ├── brand/                 # brand-page components — Phase 3+
│   └── shared/                # cross-cutting components (theme-provider)
├── lib/
│   ├── utils.ts              # cn(), formatPrice(), slugify(), clamp()
│   ├── motion.ts             # Framer Motion variants/transitions
│   └── gsap.ts                # GSAP + ScrollTrigger registration
├── hooks/
│   ├── use-gsap.ts           # gsap.context() lifecycle hook
│   ├── use-media-query.ts
│   └── use-reduced-motion.ts
├── config/
│   └── site.ts               # site metadata, brand palette, social links
├── data/                     # static/content data sources — later phases
├── types/
│   └── index.ts               # ScentAura, ThemeMode
├── utils/
│   └── constants.ts          # breakpoints, z-index scale
├── styles/                   # reserved for non-Tailwind CSS, if ever needed
└── public/
    ├── fonts/
    └── images/
```

Absolute imports are configured via the `@/*` alias (see `tsconfig.json`),
with additional scoped aliases (`@/components/*`, `@/lib/*`, `@/hooks/*`,
etc.) for shorter, unambiguous imports as the codebase grows.

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000, Turbopack dev server
```

Other scripts:

```bash
npm run build       # production build
npm run start        # serve the production build
npm run lint          # ESLint
npm run lint:fix       # ESLint with autofix
npm run format          # Prettier, writes changes
npm run format:check     # Prettier, check only
npm run typecheck         # tsc --noEmit
```

### Adding shadcn/ui components

`components.json` is already configured (`new-york` style, CSS variables,
`neutral` base color, Lucide icons). Once dependencies are installed:

```bash
npx shadcn@latest add button
```

Generated components land in `components/ui/`.

## Roadmap

```
[ Phase 1: Architecture ] → [ Phase 2: Cinematic Landing ] → [ Phase 3: Brand & Review Pages ] → [ Phase 4: AI Fragrance Finder ]
```

- **Phase 1 — Architecture** ✅ *(this repository)*: Next.js 15 + TypeScript +
  Tailwind + shadcn/ui foundation, design tokens, motion infrastructure.
- **Phase 2 — Cinematic Landing**: homepage hero, scent-aura showcase,
  scroll-driven GSAP/Framer sequences.
- **Phase 3 — Brand & Review Pages**: review templates, brand pages,
  categories, search.
- **Phase 4 — AI Fragrance Finder**: guided recommendation flow, plus
  newsletter, affiliate integration, and admin CMS.

## License

Proprietary — all rights reserved.
