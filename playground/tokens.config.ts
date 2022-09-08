import { defineTheme, palette } from '../src'

export default defineTheme({
  fonts: {
    primary: {
      value: 'Inter, sans-serif',
    },
  },

  colors: {
    primary: palette('rgb(49, 52, 66)'),
    grape: {
      value: 'blue',
    },
    lila: {
      value: '#BB9BB0',
    },
    grey: {
      value: '#CCBCBC',
    },
    lavender: {
      value: '#F1E3E4',
    },
    velvet: {
      value: '#502274',
    },
  },

  screens: {
    sm: { value: '640px' },
    md: { value: '768px' },
    lg: { value: '1024px' },
    xl: { value: '1280px' },
  },
})
