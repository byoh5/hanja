/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        mist: '#F7F8FA',
        calm: {
          50: '#F1F7FF',
          100: '#E2EEFF',
          300: '#A8CBFF',
          500: '#0A84FF',
          600: '#006AE6'
        },
        coral: {
          100: '#FFEAE8',
          500: '#FF8B85'
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'Noto Sans KR', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif']
      },
      boxShadow: {
        soft: '0 8px 24px rgba(17, 17, 17, 0.05)',
        quiet: '0 2px 8px rgba(17, 17, 17, 0.04)'
      }
    }
  },
  plugins: []
};
