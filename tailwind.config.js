/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0f0e12',
          soft: '#1a1822',
          muted: '#5c5854',
        },
        surface: {
          DEFAULT: '#f7f5f2',
          elevated: '#ffffff',
          sunken: '#efecea',
        },
        copper: {
          DEFAULT: '#c4784a',
          bright: '#e0986a',
          deep: '#8f4f2e',
          muted: '#c4784a33',
        },
        pearl: '#faf8f5',
        night: {
          DEFAULT: '#0c0a10',
          glow: '#1e1830',
        },
        // Legacy aliases — map to new palette
        obsidian: {
          DEFAULT: '#0f0e12',
          50: '#1a1822',
          100: '#14131a',
          200: '#111018',
        },
        gold: {
          DEFAULT: '#c4784a',
          light: '#e0986a',
          dark: '#8f4f2e',
          muted: '#8f4f2e',
        },
        cream: {
          DEFAULT: '#efecea',
          dark: '#e5e1dc',
          muted: '#d4cfc8',
        },
        paper: {
          DEFAULT: '#f7f5f2',
          dark: '#efecea',
        },
        velvet: {
          DEFAULT: '#0c0a10',
          50: '#1e1830',
          100: '#120e1a',
        },
        alabaster: {
          DEFAULT: '#faf8f5',
          dark: '#efecea',
        },
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(15, 14, 18, 0.08)',
        lift: '0 12px 40px -8px rgba(15, 14, 18, 0.14)',
        glow: '0 0 0 1px rgba(196, 120, 74, 0.15), 0 8px 32px -8px rgba(196, 120, 74, 0.25)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      animation: {
        blob: 'blob 7s infinite',
        'spin-slow': 'spin 12s linear infinite',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
