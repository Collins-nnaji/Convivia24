/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@neondatabase/auth-ui/dist/**/*.{js,mjs}',
  ],
  theme: {
    extend: {
      colors: {
        /* Convene palette */
        ivory: {
          DEFAULT: '#faf6ee',
          2: '#f4ede0',
        },
        ink: {
          DEFAULT: '#1a1714',
          2: '#2d2925',
        },
        cv: {
          muted:  '#756c5e',
          muted2: '#a89e8e',
        },
        /* Event-type accents (for Tailwind utility classes) */
        wedding:   '#c0975a',
        birthday:  '#e85d4b',
        engage:    '#d97b9c',
        corporate: '#2a4870',
        club:      '#7c5bff',
        dinner:    '#8b2535',
        festival:  '#e09f3e',
        baby:      '#8aa085',
        memorial:  '#5a6573',
        /* Legacy compat */
        obsidian: { DEFAULT: '#0a0a0a', 50: '#1a1a1a', 100: '#141414', 200: '#111111' },
        gold:     { DEFAULT: '#c0975a', light: '#e2c97e', dark: '#a07c28', muted: '#8b6914' },
        cream:    { DEFAULT: '#f4ede0', dark: '#ede5d4', muted: '#d9cebb' },
      },
      fontFamily: {
        display: ['var(--font-instrument)', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans:    ['var(--font-geist)', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono:    ['var(--font-geist-mono)', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      borderRadius: {
        'cv-card': '18px',
        'cv-soft': '10px',
      },
      animation: {
        blob: 'blob 7s infinite',
        'spin-slow': 'spin 12s linear infinite',
        'cv-fade-up': 'cv-fade-up 0.35s ease both',
        'cv-pulse-dot': 'cv-pulse-dot 1.6s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%':   { transform: 'translate(0px, 0px) scale(1)' },
          '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
