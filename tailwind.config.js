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
        // New brand palette from HTML design
        'brand-red': '#e31e24',
        'brand-red-hover': '#c41a1f',
        'brand-dark': '#1a1a1a',
        'brand-gray': '#f5f5f5',
        'brand-border': '#e5e5e5',
        'brand-green': '#16a34a',
        // Legacy aliases kept for backward compat
        'chicken-red': '#DC2626',
        'chicken-yellow': '#F59E0B',
        'chicken-orange': '#EA580C',
        'chicken-fresh-orange': '#F97316',
        'chicken-gold': '#FCD34D',
        'chicken-cream': '#fafafa',
        'chicken-green': '#16A34A',
        'chicken-wood': '#78350F',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        'chicken': ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(0, 0, 0, 0.05), 0 2px 8px rgba(0, 0, 0, 0.04)',
        card: '0 2px 8px rgba(0, 0, 0, 0.06), 0 4px 12px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.10)',
        'brand': '0 10px 30px rgba(227, 30, 36, 0.3)',
        'brand-sm': '0 0 15px rgba(227, 30, 36, 0.3)',
      },
      borderRadius: {
        card: '1rem',
        'card-lg': '1.25rem',
        button: '0.75rem',
        'button-lg': '1rem',
        pill: '9999px',
      },
      transitionDuration: {
        smooth: '300ms',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #e31e24 0%, #c41a1f 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #c41a1f 0%, #a01518 100%)',
      },
    },
  },
  plugins: [],
}
