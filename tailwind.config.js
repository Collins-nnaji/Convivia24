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
        ember: {
          DEFAULT: '#E23B2F',
          light:   '#F05A4F',
          dark:    '#B82C22',
          muted:   '#C43A30',
        },
        // Legacy aliases → ember (keeps older class names from soft-parked pages working)
        gold: {
          DEFAULT: '#E23B2F',
          light:   '#F05A4F',
          dark:    '#B82C22',
          muted:   '#C43A30',
        },
        cream: {
          DEFAULT: '#F7F5F3',
          base:    '#FAFAF8',
          dark:    '#EDEAE6',
          muted:   '#D4CFC8',
        },
        champagne: '#E23B2F',
        paper: {
          DEFAULT: '#FAFAF8',
          dark:    '#F0EEEC',
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'sans-serif'],
        sans:    ['var(--font-outfit)', 'sans-serif'],
      },
      animation: {
        blob: "blob 7s infinite",
        'spin-slow': 'spin 12s linear infinite',
        'dissolve': 'dissolve 0.6s ease-out forwards',
        marquee: 'marquee 28s linear infinite',
      },
      keyframes: {
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        dissolve: {
          '0%':   { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' },
          '60%':  { opacity: 0.5, transform: 'scale(1.02)', filter: 'blur(2px)' },
          '100%': { opacity: 0, transform: 'scale(0.98)', filter: 'blur(4px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
