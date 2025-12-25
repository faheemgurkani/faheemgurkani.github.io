/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        neutral: {
          950: '#0a0a0a',
          900: '#171717',
          850: '#202020',
          800: '#262626',
        }
      }
    },
  },
  plugins: [],
}