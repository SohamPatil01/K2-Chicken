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
        'chicken-gold': '#FCD34D',
      },
      fontFamily: {
        'chicken': ['Comic Sans MS', 'cursive'],
      },
    },
  },
  plugins: [],
}
