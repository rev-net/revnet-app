const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1225px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-simplon-norm)", ...defaultTheme.fontFamily.sans],
        mono: ["var(--font-simplon-mono)", ...defaultTheme.fontFamily.mono],
      },
      colors: {
        'custom-purple': 'oklch(89.4% 0.057 293.283)',
        'deep-purple': 'oklch(0.2056 0.0361 316.59)',
        'custom-peach': 'oklch(0.7618 0.1455 39.18)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/forms")],
};
