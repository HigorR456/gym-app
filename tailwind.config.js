/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        surface: {
          DEFAULT: '#171717',
          100: '#262626',
          200: '#404040',
        },
        primary: '#FACC15',
        text: '#FFFFFF',
      },
    },
  },
  plugins: [],
};
