module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      borderWidth: {
        'r4': '1rem'
      }
    },
  },
  variants: {
    extend: {
      opacity: ['disabled']
    }
  },
  plugins: [],
}
