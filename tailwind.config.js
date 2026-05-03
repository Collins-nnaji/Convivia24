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
            DEFAULT: '#0f0f14',
            50:  '#1a1a24',
            100: '#141420',
            200: '#111118',
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
          // Light theme tokens
          surface: {
            DEFAULT: '#ffffff',
            50:  '#fafaf8',
            100: '#f8f7f5',
            200: '#f2f0eb',
            300: '#e8e4db',
          },
          ink: {
            DEFAULT: '#0f0f14',
            muted:   '#6b6880',
            subtle:  '#9997a8',
            faint:   '#c4c2cf',
          },
        },
        fontFamily: {
          display: ['var(--font-cormorant)', 'Georgia', 'serif'],
          sans:    ['var(--font-outfit)', 'sans-serif'],
        },
        animation: {
          blob: "blob 7s infinite",
          'spin-slow': 'spin 12s linear infinite',
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
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }
