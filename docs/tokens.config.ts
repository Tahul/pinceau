import { defineTheme, palette } from 'pinceau'

export default defineTheme({
  font: {
    sans: '\'PaytoneOne\'',
  },
  color: {
    white: '#FBEFDE',
    primary: {
      50: '{color.red.50}',
      100: '{color.red.100}',
      200: '{color.red.100}',
      300: '{color.red.100}',
      400: '{color.red.100}',
      500: '{color.red.100}',
      600: '{color.red.100}',
      700: '{color.red.100}',
      800: '{color.red.100}',
      900: '{color.red.100}',
    },
    blue: palette(
      '#4560B0',
      [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      0.15,
    ),
    red: palette(
      '#ED4D31',
      [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      0.15,
    ),
    green: palette(
      '#36D397',
      [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
      0.15,
    ),
  },
  elements: {
    backdrop: {
      background: {
        initial: '{color.white}',
        dark: '{color.black}',
      },
    },
  },
})
