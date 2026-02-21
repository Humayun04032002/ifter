/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        mosque: {
          50: '#fdfbf7',   // Background Cream
          100: '#f0fdf4',  // Light Green Hover
          600: '#059669',  // Primary Green
          700: '#047857',  // Deep Green
        },
        gold: '#d4af37',   // Icons/Accents
      },
    },
  },
  plugins: [],
}