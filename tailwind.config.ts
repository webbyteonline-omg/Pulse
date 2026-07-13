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
        // DockIn "clay" palette — claymorphism accent colors (theme-invariant
        // brand hues). Each has a -dim (26% alpha) variant for tinted fills.
        clay: {
          purple: "#7C5CFC",
          "purple-dim": "#7C5CFC26",
          pink: "#FB6F92",
          "pink-dim": "#FB6F9226",
          orange: "#F59E42",
          "orange-dim": "#F59E4226",
          green: "#2FBF87",
          "green-dim": "#2FBF8726",
          yellow: "#EFC94C",
          "yellow-dim": "#EFC94C26",
          blue: "#4F86F7",
          "blue-dim": "#4F86F726",
          red: "#EF4E4E",
          "red-dim": "#EF4E4E26",
          teal: "#4BC4C9",
          "teal-dim": "#4BC4C926",
        },
      },
      borderRadius: {
        card: "20px",
        hero: "24px",
        btn: "14px",
        input: "10px",
        clay: "28px",
        "clay-lg": "36px",
      },
      backgroundImage: {
        "pulse-gradient": "linear-gradient(135deg, #6C63FF, #4FACFE)",
        // DockIn signature violet gradient (buttons, logo, accents)
        "clay-violet": "linear-gradient(145deg, #8B6BFF, #6C4FE8)",
        "clay-violet-h": "linear-gradient(90deg, #8B6BFF, #6C4FE8)",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "var(--font-inter)", "system-ui", "sans-serif"],
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
