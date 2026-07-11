import type { Config } from "tailwindcss";

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
        bg: "#0F0F13",
        card: "#1A1A24",
        "card-hover": "#1F1F2C",
        line: "#2A2A3A",
        primary: { DEFAULT: "#6C63FF", dim: "#6C63FF26" },
        accent: { DEFAULT: "#FF6584", dim: "#FF658426" },
        success: { DEFAULT: "#43D98C", dim: "#43D98C26" },
        warning: { DEFAULT: "#FFB347", dim: "#FFB34726" },
        danger: { DEFAULT: "#FF5C5C", dim: "#FF5C5C26" },
        ink: { DEFAULT: "#F0F0F5", dim: "#8888A0", faint: "#55556A" },
      },
      borderRadius: {
        card: "16px",
        btn: "12px",
        input: "8px",
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
