/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#01003F',
          600: '#1e40af',
          900: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}


