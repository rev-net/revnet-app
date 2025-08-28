// prettier.config.js, .prettierrc.js, prettier.config.mjs, or .prettierrc.mjs

/** @type {import("prettier").Config} */
const config = {
  printWidth: 80,
  semi: true, // Add semicolons at the end of statements (safer, more common)
  quoteProps: "as-needed", // Only add quotes around object properties where required
  jsxSingleQuote: false, // Use double quotes in JSX attributes (common React preference)
  bracketSpacing: true, // Add spaces inside object literals (e.g., { foo: bar })
  arrowParens: "always", // Always include parentheses around arrow function parameters (e.g., (x) => x)

  // Next.js specific plugin for Tailwind CSS class sorting (highly recommended if you use Tailwind)
  // You'll need to install this: `npm install -D prettier-plugin-tailwindcss` or `yarn add -D prettier-plugin-tailwindcss`
  plugins: ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
};

export default config;
