/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // src altındaki tüm js ve jsx'leri tara demek
  ],
  theme: {
    extend: {
      colors: {
        monad: {
          dark: '#0E0C15',
          purple: '#A855F7',
          deep: '#200052',
          neon: '#C084FC'
        }
      }
    },
  },
  plugins: [],
}