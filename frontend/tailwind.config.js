/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Fundo "papel" quente: menos cansativo que o branco puro para leitura longa
        paper: {
          DEFAULT: '#F6F3EE',
          deep: '#ECE6DC'
        },
        // Tinta: texto principal com contraste AAA sobre o papel
        ink: {
          DEFAULT: '#1D2433',
          soft: '#3F4757',
          muted: '#5C6473'
        },
        // Verde-pinho: cor principal, ligada a cuidado e saúde
        pine: {
          50: '#EEF6F3',
          100: '#D7EBE3',
          200: '#AFD5C7',
          300: '#7DB9A4',
          500: '#2F8A72',
          600: '#22735E',
          700: '#1A5E4C',
          800: '#144B3D',
          900: '#0F3A30',
          950: '#0A2821'
        },
        // Argila: acento quente para contas, prazos e destaques
        clay: {
          50: '#FBF2EB',
          100: '#F5DECD',
          300: '#E2A47E',
          500: '#C2683C',
          600: '#A4542D',
          700: '#844325'
        }
      },
      fontFamily: {
        sans: ['Lexend', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif']
      },
      boxShadow: {
        soft: '0 1px 2px rgba(29, 36, 51, 0.04), 0 10px 30px -14px rgba(29, 36, 51, 0.18)',
        lift: '0 2px 4px rgba(29, 36, 51, 0.05), 0 18px 40px -16px rgba(29, 36, 51, 0.28)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'scan': 'scan 1.8s ease-in-out infinite'
      }
    },
  },
  plugins: [],
}
