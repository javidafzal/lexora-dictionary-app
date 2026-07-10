/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0A08",
        parchment: "#F4EFE4",
        gold: "#C9A24B",
      },
      fontFamily: {
        // "Lexora" brand font retired in favor of Geist (Google Fonts).
        // `serif` is kept as an alias so existing `font-serif` headings
        // don't need to be touched across every page.
        serif: ["'Geist'", "sans-serif"],
        sans: ["'Geist'", "sans-serif"],
        mono: ["'Geist Mono'", "monospace"],
      },
      borderRadius: {
        "50": "50px",
      },
    },
  },
  plugins: [],
};
