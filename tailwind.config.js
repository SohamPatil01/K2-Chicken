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
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 12px 24px -4px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 12px 40px -8px rgba(0, 0, 0, 0.12), 0 20px 32px -8px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        card: '1rem',
        'card-lg': '1.25rem',
        button: '0.75rem',
        'button-lg': '1rem',
      },
      transitionDuration: {
        smooth: '300ms',
      },
    },
  },
  plugins: [],
}
