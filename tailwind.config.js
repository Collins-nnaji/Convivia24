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
          /* ── Primary brand palette ── */
          brand: {
            DEFAULT: '#E8181A',   // Convivia red
            dark:    '#B91215',   // deep red
            light:   '#FF3B3E',   // bright red
            muted:   '#F87171',   // soft red
            faint:   '#FEE2E2',   // red tint bg
          },
          /* ── Neutral ── */
          ink: {
            DEFAULT: '#0f0f0f',
            80:      '#1a1a1a',
            60:      '#525252',
            40:      '#888888',
            20:      '#c0c0c0',
            10:      '#e5e5e5',
          },
          surface: {
            DEFAULT: '#ffffff',
            50:      '#fafafa',
            100:     '#f5f5f5',
            200:     '#ebebeb',
            300:     '#d4d4d4',
          },
          /* ── Keep obsidian for dark section backgrounds ── */
          obsidian: {
            DEFAULT: '#0f0f0f',
            50:      '#1a1a1a',
            100:     '#141414',
          },
          /* ── Keep cream for text on dark ── */
          cream: {
            DEFAULT: '#f5f5f5',
            dark:    '#e5e5e5',
          },
          /* ── Legacy alias so existing classes don't break ── */
          gold: {
            DEFAULT: '#E8181A',
            light:   '#FF3B3E',
            dark:    '#B91215',
            muted:   '#F87171',
          },
        },
        fontFamily: {
          display: ['var(--font-cormorant)', 'Georgia', 'serif'],
          sans:    ['var(--font-jakarta)', 'system-ui', 'sans-serif'],
        },
        animation: {
          blob:         'blob 7s infinite',
          'spin-slow':  'spin 12s linear infinite',
          'fade-up':    'fadeUp 0.5s ease forwards',
          'scale-in':   'scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards',
          'slide-up':   'slideUp 0.35s cubic-bezier(0.22,1,0.36,1) forwards',
          'pulse-red':  'pulseRed 2s ease-in-out infinite',
        },
        keyframes: {
          blob: {
            '0%':   { transform: 'translate(0px, 0px) scale(1)' },
            '33%':  { transform: 'translate(30px, -50px) scale(1.1)' },
            '66%':  { transform: 'translate(-20px, 20px) scale(0.9)' },
            '100%': { transform: 'translate(0px, 0px) scale(1)' },
          },
          fadeUp: {
            from: { opacity: '0', transform: 'translateY(20px)' },
            to:   { opacity: '1', transform: 'translateY(0)' },
          },
          scaleIn: {
            from: { opacity: '0', transform: 'scale(0.88)' },
            to:   { opacity: '1', transform: 'scale(1)' },
          },
          slideUp: {
            from: { opacity: '0', transform: 'translateY(32px)' },
            to:   { opacity: '1', transform: 'translateY(0)' },
          },
          pulseRed: {
            '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,24,26,0.4)' },
            '50%':      { boxShadow: '0 0 0 12px rgba(232,24,26,0)' },
          },
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  }
