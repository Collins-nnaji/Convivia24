/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      // Bare opacity modifiers (text-white/45, from-black/55, border-obsidian/8…)
      // only compile for steps that exist on this scale — anything else emits no
      // CSS at all. The app uses these intermediate steps throughout, so they
      // have to be declared here.
      opacity: {
        6: '0.06',
        8: '0.08',
        12: '0.12',
        15: '0.15',
        35: '0.35',
        45: '0.45',
        55: '0.55',
        65: '0.65',
        85: '0.85',
      },
      colors: {
        obsidian: {
          DEFAULT: '#0a0a0a',
          50:  '#1a1a1a',
          100: '#141414',
          200: '#111111',
        },
        ember: {
          DEFAULT: '#8B2A22',
          light:   '#A3382E',
          dark:    '#4A1512',
          muted:   '#6E1F1A',
        },
        // Legacy aliases → ember (keeps older class names from soft-parked pages working)
        gold: {
          DEFAULT: '#8B2A22',
          light:   '#A3382E',
          dark:    '#4A1512',
          muted:   '#6E1F1A',
        },
        cream: {
          DEFAULT: '#F7F5F3',
          base:    '#FAFAF8',
          dark:    '#EDEAE6',
          muted:   '#D4CFC8',
        },
        champagne: '#8B2A22',
        paper: {
          DEFAULT: '#FAFAF8',
          dark:    '#F0EEEC',
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'sans-serif'],
        logo:    ['var(--font-montserrat)', 'sans-serif'],
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
