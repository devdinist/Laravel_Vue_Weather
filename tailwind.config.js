module.exports = {
  purge: [],
  important : true,
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing:{
        '128' : '32rem',
      },
      height:{
        '30r' : '30rem',
      }
    },
    minHeight:{
        '640' : '40.5rem',
        '70' : '4.5rem',
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
