import type { Config } from "tailwindcss";

/** Theme-aware color: RGB triple variable + Tailwind alpha support. */
const v = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: v("bg"),
        card: v("card"),
        "card-hover": v("card-hover"),
        line: v("line"),
        input: v("input"),
        "chart-bar": v("chart-bar"),
        sky: { DEFAULT: "#4FACFE", dim: "#4FACFE26" },
        primary: { DEFAULT: "#6C63FF", dim: "#6C63FF26" },
        accent: { DEFAULT: "#FF6584", dim: "#FF658426" },
        success: { DEFAULT: "#43D98C", dim: "#43D98C26" },
        warning: { DEFAULT: "#FFB347", dim: "#FFB34726" },
        danger: { DEFAULT: "#FF5C5C", dim: "#FF5C5C26" },
        ink: { DEFAULT: v("ink"), dim: v("ink-dim"), faint: v("ink-faint") },
      },
      borderRadius: {
        card: "20px",
        hero: "24px",
        btn: "14px",
        input: "10px",
      },
      backgroundImage: {
        "pulse-gradient": "linear-gradient(135deg, #6C63FF, #4FACFE)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition: "400px 0" },
        },
      },
      animation: {
        shimmer: "shimmer 1.4s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
