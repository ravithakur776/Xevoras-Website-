/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: "#101010",
          deep: "#0A0A0A",
          surface: "#141414",
        },
        charcoal: {
          DEFAULT: "#1C1C1C",
          elevated: "#242424",
          light: "#2E2E2E",
        },
        ivory: {
          DEFAULT: "#F5F1E8",
          muted: "#EADFCF",
          pure: "#FCFAF6",
        },
        gold: {
          DEFAULT: "#B89560",
          light: "#D6B584",
          hover: "#C9A771",
          deep: "#9E7B49",
        },
        stone: {
          DEFAULT: "#B9ADA1",
          dark: "#8C8074",
          hairline: "rgba(185, 173, 161, 0.18)",
        },
        clay: {
          DEFAULT: "#704B40",
          warm: "#8A5E51",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        hindi: ["var(--font-rozha)", "Rozha One", "Noto Serif Devanagari", "serif"],
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1440px",
      },
      borderRadius: {
        luxury: "3px",
      },
      boxShadow: {
        gold: "0 8px 30px -4px rgba(184, 149, 96, 0.22)",
        "gold-lg": "0 14px 40px -4px rgba(184, 149, 96, 0.35)",
        luxury: "0 20px 48px -10px rgba(0, 0, 0, 0.65)",
      },
    },
  },
  plugins: [],
};
