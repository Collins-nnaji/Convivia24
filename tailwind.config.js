/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./app/**/*.{js,jsx,ts,tsx}",
      "./components/**/*.{js,jsx,ts,tsx}",
      "./src/**/*.{js,jsx,ts,tsx}",
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
            base:    '#FDFBF7',
            dark:    '#ede5d4',
            muted:   '#d9cebb',
          },
          champagne: '#C5A043',
          paper: {
            DEFAULT: '#faf7f1',
            dark:    '#f1ece2',
          },
        },
        fontFamily: {
          display: ['var(--font-cormorant)', 'Georgia', 'serif'],
          sans:    ['var(--font-outfit)', 'sans-serif'],
        },
        animation: {
          blob: "blob 7s infinite",
          'spin-slow': 'spin 12s linear infinite',
          'dissolve': 'dissolve 0.6s ease-out forwards',
        },
        keyframes: {
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
          dissolve: {
            '0%':   { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
            '60%':  { opacity: 0.5, transform: 'scale(1.02)', filter: 'blur(2px)' },
            '100%': { opacity: 0, transform: 'scale(0.98)', filter: 'blur(4px)' },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }
