/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // any.do-inspired palette
        primary: {
          50:  '#fff0f0',
          100: '#ffd6d6',
          200: '#ffb3b3',
          300: '#ff8080',
          400: '#f05a5a',
          500: '#E84040',  // brand coral-red
          600: '#cc2828',
          700: '#a81e1e',
          800: '#861818',
          900: '#6b1515',
        },
        surface: '#FAFAFA',   // page background
        card: '#FFFFFF',      // task card
        muted: '#6B7280',     // secondary text
        border: '#E5E7EB',    // subtle borders
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
};
