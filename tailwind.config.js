/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // NEUER BLOCK STARTET HIER
  safelist: [
    {
      pattern: /bg-(red|green|blue|yellow|purple|pink|gray|orange)-(50|100|200|400|500|600|700|800)/,
    },
    {
      pattern: /text-(red|green|blue|yellow|purple|pink|gray|orange)-(400|500|600|700|800)/,
    },
    {
      pattern: /border-(red|green|blue|yellow|purple|pink|gray|orange)-(200|300|500)/,
    },
    {
      pattern: /from-(purple|pink|green|blue)-(50|100|500|600)/,
    },
    {
      pattern: /to-(purple|pink|green|blue)-(50|100|500|600|700)/,
    },
  ],
  // NEUER BLOCK ENDET HIER
  theme: {
    extend: {},
  },
  plugins: [],
}