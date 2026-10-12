/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0a0f',
          surface: '#13131a',
          border: '#1f1f2e',
          text: '#f3f4f6',
          muted: '#9ca3af'
        },
        brand: {
          primary: '#6366f1', // Indigo
          accent: '#8b5cf6', // Violet
          glow: 'rgba(99, 102, 241, 0.5)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'float-medium': 'float 4s ease-in-out infinite',
        'float-fast': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) translateX(0)' },
          '33%': { transform: 'translateY(-10px) translateX(5px)' },
          '66%': { transform: 'translateY(5px) translateX(-5px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)' },
          '50%': { opacity: .7, boxShadow: '0 0 35px rgba(99, 102, 241, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
