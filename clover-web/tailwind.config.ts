import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        clover: {
          50: "#f0faf4",
          100: "#d8f3e3",
          200: "#b4e8c8",
          300: "#7dd4a5",
          400: "#34a05a",
          500: "#1a7a45",
          600: "#156338",
          700: "#0f4e2c",
          800: "#0c3d22",
          900: "#0a2e1a",
        },
        gold: {
          200: "#f0d98a",
          300: "#e2c34a",
          400: "#c9a227",
          500: "#a67d18",
          600: "#7d5e10",
        },
        surface: {
          base: "#0d1117",
          elevated: "#161b22",
          floating: "#21262d",
          border: "#30363d",
        },
        mist: "#f0faf4",
      },
      fontFamily: {
        display: ["'Fraunces'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "glow-green": "0 0 24px 0 rgba(26,122,69,0.35), 0 2px 8px 0 rgba(0,0,0,0.4)",
        "glow-gold": "0 0 20px 0 rgba(201,162,39,0.3), 0 2px 6px 0 rgba(0,0,0,0.4)",
        card: "0 1px 3px 0 rgba(0,0,0,0.4), 0 4px 16px 0 rgba(0,0,0,0.25)",
        "card-hover": "0 2px 6px 0 rgba(0,0,0,0.5), 0 8px 32px 0 rgba(0,0,0,0.3)",
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter: "-0.03em",
        tight: "-0.015em",
      },
      lineHeight: {
        reading: "1.75",
      },
    },
  },
  plugins: [],
} satisfies Config;
