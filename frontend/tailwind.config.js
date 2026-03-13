/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#080812',
          secondary: '#0E0E1C',
          card: '#13132A',
          hover: '#1A1A36',
          border: '#1E1E3A',
        },
        profit: {
          DEFAULT: '#00D4AA',
          dim: 'rgba(0,212,170,0.12)',
          glow: 'rgba(0,212,170,0.3)',
        },
        loss: {
          DEFAULT: '#FF4757',
          dim: 'rgba(255,71,87,0.12)',
          glow: 'rgba(255,71,87,0.3)',
        },
        accent: {
          DEFAULT: '#6366F1',
          dim: 'rgba(99,102,241,0.15)',
          glow: 'rgba(99,102,241,0.3)',
        },
        muted: '#8B8BAD',
        subtle: '#3A3A5C',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.4)',
        glow: '0 0 20px rgba(99,102,241,0.2)',
        profit: '0 0 20px rgba(0,212,170,0.15)',
        loss: '0 0 20px rgba(255,71,87,0.15)',
      },
    },
  },
  plugins: [],
}
