/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'chicken-red': '#DC2626',
        'chicken-yellow': '#F59E0B',
        'chicken-orange': '#EA580C',
        'chicken-fresh-orange': '#F97316',
        'chicken-gold': '#FCD34D',
        'chicken-cream': '#FFFAF5',
        'chicken-green': '#16A34A',
        'chicken-wood': '#78350F',
      },
      fontFamily: {
        'chicken': ['Comic Sans MS', 'cursive'],
      },
    },
  },
  plugins: [],
}
