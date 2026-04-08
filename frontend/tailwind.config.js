/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0e1a',
          panel: '#0d1426',
          border: '#1a2744',
          cyan: '#00d4ff',
          violet: '#7c3aed',
          green: '#00ff88',
          red: '#ff2d55',
          orange: '#ff6b35',
          yellow: '#ffd60a',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        pulse_slow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        scan: 'scan 4s linear infinite',
        flicker: 'flicker 0.15s infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '100%': { boxShadow: '0 0 20px #00d4ff, 0 0 40px #00d4ff, 0 0 80px #00d4ff' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        flicker: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        },
      },
      backdropBlur: { xs: '2px' },
    },
  },
  plugins: [],
};
