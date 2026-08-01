/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0F1222',
        paper: '#F7F7FB',
        line: '#E4E4EE',
        brand: {
          50: '#EEF0FF',
          100: '#E0E3FF',
          200: '#C6CBFF',
          300: '#A3A9FF',
          400: '#7C7FF7',
          500: '#5B5EE8',
          600: '#4740D4',
          700: '#3931AD',
          800: '#2E2A87',
          900: '#211E5E',
        },
        hot: '#DC4444',
        warm: '#D68B1F',
        cold: '#3E7CB1',
      },
      fontFamily: {
        display: ['Söhne', 'ui-sans-serif', '-apple-system', 'Segoe UI', 'system-ui', 'sans-serif'],
        body: ['ui-sans-serif', '-apple-system', 'Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,18,34,0.04), 0 1px 8px rgba(15,18,34,0.06)',
        pop: '0 8px 30px rgba(15,18,34,0.12)',
      },
      borderRadius: {
        xl2: '1.1rem',
      },
    },
  },
  plugins: [],
};
