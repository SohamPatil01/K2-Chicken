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
        'k2-green': '#123D2B',
        'k2-green-deep': '#0B2A1E',
        'k2-green-soft': '#1A5640',
        'k2-saffron': '#F4720B',
        'k2-saffron-hot': '#E05A00',
        'k2-cream': '#FAF4E8',
        'k2-cream-dark': '#F1E7D2',
        'k2-ice': '#BFE8D9',
        'k2-ink': '#16201B',
        'k2-paper': 'rgba(18,61,43,.14)',
        // Aliases for backward compat across the app
        'brand-red': '#F4720B',
        'brand-red-hover': '#E05A00',
        'brand-dark': '#0B2A1E',
        'brand-gray': '#F1E7D2',
        'brand-border': 'rgba(18,61,43,.14)',
        'brand-green': '#1A5640',
        'chicken-red': '#F4720B',
        'chicken-yellow': '#F4720B',
        'chicken-orange': '#E05A00',
        'chicken-fresh-orange': '#F4720B',
        'chicken-gold': '#F1E7D2',
        'chicken-cream': '#FAF4E8',
        'chicken-green': '#123D2B',
        'chicken-wood': '#0B2A1E',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        serif: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
        chicken: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '18px',
        'card-lg': '24px',
        button: '10px',
        'button-lg': '14px',
        pill: '9999px',
      },
      boxShadow: {
        soft: '0 1px 3px rgba(18, 61, 43, 0.06), 0 2px 8px rgba(18, 61, 43, 0.04)',
        card: '0 8px 24px rgba(18, 61, 43, 0.08)',
        'card-hover': '0 24px 50px rgba(18, 61, 43, 0.14)',
        brand: '0 8px 24px rgba(244, 114, 11, 0.35)',
        'brand-sm': '0 0 15px rgba(244, 114, 11, 0.3)',
        hero: '0 30px 70px rgba(0, 0, 0, 0.35)',
      },
      transitionDuration: {
        smooth: '300ms',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #F4720B 0%, #E05A00 100%)',
        'brand-gradient-hover': 'linear-gradient(135deg, #E05A00 0%, #C44E00 100%)',
        'green-gradient': 'linear-gradient(135deg, #123D2B 0%, #1A5640 100%)',
      },
      keyframes: {
        marquee: {
          to: { transform: 'translateX(-50%)' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.5)', opacity: '1' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        drawLine: {
          to: { strokeDashoffset: '0' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        'marquee-slow': 'marquee 32s linear infinite',
        'pulse-ring': 'pulseRing 1.8s ease-out infinite',
        'draw-line': 'drawLine 1s 0.8s ease forwards',
        'fade-up': 'fadeUp 0.4s ease',
      },
    },
  },
  plugins: [],
}
