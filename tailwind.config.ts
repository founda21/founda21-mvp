import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emerald: "#01884E",
        // Reactive — swaps via the `.dark` ancestor class (see globals.css).
        // Everywhere this is used as body text/borders it correctly inverts;
        // the few solid-fill "active tab / button" spots use `brand` instead.
        navy: "rgb(var(--navy-rgb) / <alpha-value>)",
        // Fixed alias of the original navy hex, for elements that must stay
        // dark-navy-filled with white text in both themes.
        brand: "#0A1F44",
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
