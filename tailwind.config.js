/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}",
      "./src/**/*.{js,jsx,ts,tsx}",
      "./node_modules/@neondatabase/auth-ui/dist/**/*.{js,mjs}",
    ],
    theme: {
      extend: {
        colors: {
          obsidian: {
            DEFAULT: '#0a0a0a',
            50:  '#1a1a1a',
            100: '#141414',
            200: '#111111',
          },
          gold: {
            DEFAULT: '#c9a84c',
            light:   '#e2c97e',
            dark:    '#a07c28',
            muted:   '#8b6914',
          },
          cream: {
            DEFAULT: '#f5f0e8',
            dark:    '#ede5d4',
            muted:   '#d9cebb',
          },
        },
        fontFamily: {
          display: ['var(--font-cormorant)', 'Georgia', 'serif'],
          sans:    ['var(--font-jakarta)', 'system-ui', '-apple-system', 'sans-serif'],
        },
        animation: {
          blob: "blob 7s infinite",
          'spin-slow': 'spin 12s linear infinite',
          'landing-ken-burns': 'landingKenBurns 24s ease-in-out infinite alternate',
          'landing-float': 'landingFloat 7s ease-in-out infinite',
          'landing-glow': 'landingGlow 5s ease-in-out infinite alternate',
          'landing-shine': 'landingShine 3s ease-in-out infinite',
        },
        keyframes: {
          landingKenBurns: {
            '0%': { transform: 'scale(1.06) translate(0, 0)' },
            '100%': { transform: 'scale(1.14) translate(-1%, -1%)' },
          },
          landingFloat: {
            '0%, 100%': { transform: 'translateY(0)' },
            '50%': { transform: 'translateY(-14px)' },
          },
          landingGlow: {
            '0%': { opacity: '0.35', transform: 'scale(1)' },
            '100%': { opacity: '0.65', transform: 'scale(1.08)' },
          },
          landingShine: {
            '0%, 100%': { opacity: '0.4' },
            '50%': { opacity: '1' },
          },
          blob: {
            "0%": {
              transform: "translate(0px, 0px) scale(1)",
            },
            "33%": {
              transform: "translate(30px, -50px) scale(1.1)",
            },
            "66%": {
              transform: "translate(-20px, 20px) scale(0.9)",
            },
            "100%": {
              transform: "translate(0px, 0px) scale(1)",
            },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }
