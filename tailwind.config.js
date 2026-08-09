/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        swiss: {
          offwhite: '#F4F4F0',
          black: '#111111',
          gray: '#888888',
          border: '#000000',
        },
        y2k: {
          cyan: '#00FFFF',
          magenta: '#FF00FF',
          silver: '#E0E0E0',
          neon: '#39FF14',
        },
      },
      fontFamily: {
        display: ['Inter Tight', 'Helvetica Now Display', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        y2k: '0 0 15px rgba(0, 255, 255, 0.4), inset 0 0 15px rgba(255, 255, 255, 0.6)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        y2k: '16px',
      },
    },
  },
  plugins: [],
};
