import { defineTheme } from '@pinceau/theme'

export default defineTheme({
  color: {
    primary: 'blue',
    secondary: 'black',
  },
  utils: {
    mx: (v: string) => {
      return {
        marginLeft: v,
        marginRight: v,
      }
    },
  },
})
