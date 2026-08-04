import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        sm: "2rem",
        lg: "3rem",
        xl: "4rem",
        "2xl": "6rem",
      },
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      /* ---------------------------------------------------------------- */
      /* Typography — three roles: editorial display, geometric body,     */
      /* technical mono for data / aura readouts.                         */
      /* ---------------------------------------------------------------- */
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        // Luxury, oversized display scale for cinematic hero moments.
        "display-2xl": ["8.5rem", { lineHeight: "0.95", letterSpacing: "-0.02em" }],
        "display-xl": ["6.5rem", { lineHeight: "0.97", letterSpacing: "-0.02em" }],
        "display-lg": ["4.75rem", { lineHeight: "1.02", letterSpacing: "-0.015em" }],
        "display-md": ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "display-sm": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.01em" }],
        eyebrow: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.28em" }],
      },

      /* ---------------------------------------------------------------- */
      /* Color system — shadcn/ui semantic tokens (HSL vars) layered with */
      /* the SOLSTICE core palette and the four scent-aura palettes.      */
      /* ---------------------------------------------------------------- */
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Core SOLSTICE palette
        midnight: "#050505",
        obsidian: {
          DEFAULT: "#121216",
          elevated: "#18181D",
          line: "#232329",
        },
        gold: {
          DEFAULT: "#D4AF37",
          50: "#FBF6E7",
          100: "#F6EBC7",
          200: "#EDD98F",
          300: "#E4C65C",
          400: "#DCBB49",
          500: "#D4AF37",
          600: "#B08E27",
          700: "#856B1E",
          800: "#5A4815",
          900: "#33280C",
        },

        // Light-phenomena aura palettes, one per scent
        aurora: {
          green: "#39FFC4",
          violet: "#8B6BFF",
        },
        eclipse: {
          black: "#0A0A0C",
          ember: "#FF5A2D",
        },
        corona: {
          gold: "#FFC24B",
          amber: "#F2872E",
        },
        nocturne: {
          indigo: "#382D7A",
          twilight: "#5B6FE0",
        },
      },

      /* ---------------------------------------------------------------- */
      /* Radius / spacing — generous, floating-card luxury geometry.      */
      /* ---------------------------------------------------------------- */
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 4px)",
        sm: "calc(var(--radius) - 8px)",
        xl: "calc(var(--radius) + 8px)",
        "2xl": "calc(var(--radius) + 16px)",
        "3xl": "calc(var(--radius) + 28px)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        section: "clamp(5rem, 10vw, 10rem)",
        gutter: "clamp(1.5rem, 5vw, 6rem)",
      },

      /* ---------------------------------------------------------------- */
      /* Glassmorphism + refracted-light shadows.                        */
      /* ---------------------------------------------------------------- */
      backdropBlur: {
        xs: "2px",
        glass: "20px",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
        "glow-gold": "0 0 60px -10px rgba(212, 175, 55, 0.45)",
        "glow-aurora": "0 0 80px -10px rgba(57, 255, 196, 0.35)",
        "glow-eclipse": "0 0 80px -10px rgba(255, 90, 45, 0.4)",
        "glow-corona": "0 0 80px -10px rgba(255, 194, 75, 0.45)",
        "glow-nocturne": "0 0 80px -10px rgba(91, 111, 224, 0.4)",
        float: "0 24px 60px -12px rgba(0, 0, 0, 0.55)",
      },
      backgroundImage: {
        "aurora-mesh":
          "radial-gradient(60% 60% at 20% 20%, rgba(57,255,196,0.28) 0%, transparent 60%), radial-gradient(50% 50% at 80% 30%, rgba(139,107,255,0.24) 0%, transparent 60%)",
        "eclipse-mesh":
          "radial-gradient(45% 45% at 50% 50%, rgba(255,90,45,0.35) 0%, transparent 70%)",
        "corona-mesh":
          "radial-gradient(60% 60% at 50% 10%, rgba(255,194,75,0.32) 0%, transparent 65%)",
        "nocturne-mesh":
          "radial-gradient(55% 55% at 30% 70%, rgba(91,111,224,0.3) 0%, transparent 65%), radial-gradient(40% 40% at 80% 20%, rgba(56,45,122,0.35) 0%, transparent 60%)",
        "glass-sheen":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)",
      },

      /* ---------------------------------------------------------------- */
      /* Motion — CSS keyframes for ambient/ mesh effects; Framer Motion  */
      /* and GSAP handle orchestrated, scroll-driven sequences at the     */
      /* component level (see lib/motion.ts in a later phase).            */
      /* ---------------------------------------------------------------- */
      transitionTimingFunction: {
        cinematic: "cubic-bezier(0.16, 1, 0.3, 1)",
        refract: "cubic-bezier(0.65, 0, 0.35, 1)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "aura-drift": {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "50%": { transform: "translate3d(2%, -3%, 0) scale(1.05)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aura-drift": "aura-drift 12s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
