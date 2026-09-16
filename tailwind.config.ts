// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.25rem",
        md: "1.5rem",
        lg: "2rem",
      },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        paper: {
          DEFAULT: "#F8FAFC",
          raised: "#FFFFFF",
        },

        // ✅ ink.soft + ink.muted restored (backward compat with Part 1)
        ink: {
          DEFAULT: "#0F172A",
          soft: "#3A3D45",
          muted: "#6B7280",
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },

        brand: {
          DEFAULT: "#4F46E5",
          50: "#EEF2FF",
          100: "#E0E7FF",
          200: "#C7D2FE",
          300: "#A5B4FC",
          400: "#818CF8",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          800: "#3730A3",
          900: "#312E81",
          950: "#1E1B4B",
        },

        subject: {
          math: {
            light: "#EFF6FF", DEFAULT: "#2563EB", dark: "#1E3A8A",
            50: "#EFF6FF", 100: "#DBEAFE", 200: "#BFDBFE",
            500: "#3B82F6", 600: "#2563EB", 700: "#1D4ED8", 900: "#1E3A8A",
          },
          science: {
            light: "#ECFDF5", DEFAULT: "#059669", dark: "#064E3B",
            50: "#ECFDF5", 100: "#D1FAE5", 200: "#A7F3D0",
            500: "#10B981", 600: "#059669", 700: "#047857", 900: "#064E3B",
          },
          physics: {
            light: "#F5F3FF", DEFAULT: "#7C3AED", dark: "#4C1D95",
            50: "#F5F3FF", 100: "#EDE9FE", 200: "#DDD6FE",
            500: "#8B5CF6", 600: "#7C3AED", 700: "#6D28D9", 900: "#4C1D95",
          },
          chemistry: {
            light: "#FFF7ED", DEFAULT: "#EA580C", dark: "#7C2D12",
            50: "#FFF7ED", 100: "#FFEDD5", 200: "#FED7AA",
            500: "#F97316", 600: "#EA580C", 700: "#C2410C", 900: "#7C2D12",
          },
          biology: {
            light: "#F0FDF4", DEFAULT: "#16A34A", dark: "#14532D",
            50: "#F0FDF4", 100: "#DCFCE7", 200: "#BBF7D0",
            500: "#22C55E", 600: "#16A34A", 700: "#15803D", 900: "#14532D",
          },
          english: {
            light: "#FDF4FF", DEFAULT: "#C026D3", dark: "#701A75",
            50: "#FDF4FF", 100: "#FAE8FF", 200: "#F5D0FE",
            500: "#D946EF", 600: "#C026D3", 700: "#A21CAF", 900: "#701A75",
          },
          hindi: {
            light: "#FFF7ED", DEFAULT: "#D97706", dark: "#78350F",
            50: "#FFF7ED", 100: "#FFEDD5", 200: "#FED7AA",
            500: "#F59E0B", 600: "#D97706", 700: "#B45309", 900: "#78350F",
          },
        },

        success: { 50: "#F0FDF4", 100: "#DCFCE7", 500: "#22C55E", 600: "#16A34A", 700: "#15803D" },
        warning: { 50: "#FFFBEB", 100: "#FEF3C7", 500: "#F59E0B", 600: "#D97706", 700: "#B45309" },
        danger: { 50: "#FEF2F2", 100: "#FEE2E2", 500: "#EF4444", 600: "#DC2626", 700: "#B91C1C" },
      },

      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        heading: ["var(--font-hind)", "Hind", "Noto Sans Devanagari", "var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },

      fontSize: {
        "display-xl": ["clamp(2.25rem, 8vw, 4.5rem)", { lineHeight: "0.98", letterSpacing: "-0.045em", fontWeight: "700" }],
        "display-lg": ["clamp(2rem, 6vw, 3.75rem)", { lineHeight: "1", letterSpacing: "-0.04em", fontWeight: "700" }],
        "display-md": ["clamp(1.75rem, 5vw, 3rem)", { lineHeight: "1.05", letterSpacing: "-0.035em", fontWeight: "700" }],
        h1: ["clamp(1.75rem, 4vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.025em", fontWeight: "700" }],
        h2: ["clamp(1.5rem, 3vw, 2rem)", { lineHeight: "1.15", letterSpacing: "-0.02em", fontWeight: "700" }],
        h3: ["clamp(1.25rem, 2.5vw, 1.5rem)", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "700" }],
        h4: ["clamp(1.125rem, 2vw, 1.25rem)", { lineHeight: "1.25", fontWeight: "600" }],
      },

      spacing: { 18: "4.5rem", 22: "5.5rem", 26: "6.5rem", 30: "7.5rem" },

      borderRadius: {
        "ds-sm": "0.5rem",
        "ds-md": "0.875rem",
        "ds-lg": "1rem",
        "ds-xl": "1.25rem",
        "ds-2xl": "1.5rem",
        "ds-3xl": "2rem",
        "ds-4xl": "2.5rem",
      },

      boxShadow: {
        card: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 4px 16px -8px rgb(15 23 42 / 0.10)",
        cardHover: "0 8px 28px -12px rgb(15 23 42 / 0.18)",
        soft: "0 10px 40px -20px rgb(15 23 42 / 0.20)",
        floating: "0 16px 50px -24px rgb(15 23 42 / 0.28)",
        brand: "0 12px 32px -16px rgb(79 70 229 / 0.40)",
      },

      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
        "gradient-subject-math": "linear-gradient(135deg, #3B82F6 0%, #06B6D4 100%)",
        "gradient-subject-science": "linear-gradient(135deg, #10B981 0%, #14B8A6 100%)",
        "gradient-subject-physics": "linear-gradient(135deg, #A855F7 0%, #6366F1 100%)",
        "gradient-subject-chemistry": "linear-gradient(135deg, #F97316 0%, #EF4444 100%)",
        "gradient-subject-biology": "linear-gradient(135deg, #22C55E 0%, #10B981 100%)",
        "gradient-subject-english": "linear-gradient(135deg, #D946EF 0%, #EC4899 100%)",
        "gradient-subject-hindi": "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
      },

      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },

      transitionDuration: { 180: "180ms", 240: "240ms", 320: "320ms" },

      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in-top": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.98)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },

      animation: {
        "fade-in": "fade-in 240ms ease-out",
        "slide-up": "slide-up 320ms cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-in-top": "slide-in-top 250ms cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in": "scale-in 180ms ease-out",
        shimmer: "shimmer 2s linear infinite",
      },

      screens: { xs: "375px" },

      zIndex: {
        60: "60", 70: "70", 80: "80", 90: "90", 100: "100",
        header: "50", drawer: "60", modal: "70", toast: "80",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;