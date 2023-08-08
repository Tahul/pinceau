import { defineTheme } from 'pinceau'

export default defineTheme({
  color: {
    primary: 'blue',
    secondary: 'red',
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
