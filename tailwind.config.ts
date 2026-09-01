import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        cafe: {
          50: "#faf6f2",
          100: "#f2e8df",
          200: "#e3cfbc",
          300: "#d0ad92",
          400: "#bd8a67",
          500: "#a96e49",
          600: "#8f573b",
          700: "#734533",
          800: "#5f3a2f",
          900: "#4f3229",
        },
        verde: {
          400: "#4ea86e",
          500: "#2f8f56",
          600: "#237344",
        },
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
