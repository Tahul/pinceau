import { defineTheme } from 'pinceau'

export default defineTheme({
  color: {
    black: '#0c0c0d',
    white: '{color.yellow.100}',
    primary: {
      50: '{color.red.50}',
      100: '{color.red.100}',
      200: '{color.red.200}',
      300: '{color.red.300}',
      400: '{color.red.400}',
      500: '{color.red.500}',
      600: '{color.red.600}',
      700: '{color.red.700}',
      800: '{color.red.800}',
      900: '{color.red.900}',
    },
    blue: {
      50: '#C5CDE8',
      100: '#B6C1E2',
      200: '#99A8D7',
      300: '#7B8FCB',
      400: '#5E77C0',
      500: '#4560B0',
      600: '#354A88',
      700: '#25345F',
      800: '#161E37',
      900: '#06080F',
    },
    red: {
      50: '#FCDFDA',
      100: '#FACFC7',
      200: '#F7AEA2',
      300: '#F48E7C',
      400: '#F06D57',
      500: '#ED4D31',
      600: '#D32F12',
      700: '#A0240E',
      800: '#6C1809',
      900: '#390D05',
    },
    green: {
      50: '#CDF4E5',
      100: '#BCF0DC',
      200: '#9AE9CB',
      300: '#79E2BA',
      400: '#57DAA8',
      500: '#36D397',
      600: '#26AB78',
      700: '#1B7D58',
      800: '#114F38',
      900: '#072117',
    },
    yellow: {
      50: '#FFFFFF',
      100: '#FFFFFF',
      200: '#FFFFFF',
      300: '#FFFFFF',
      400: '#FFFFFF',
      500: '#FBEFDE',
      600: '#F5D7AC',
      700: '#EFBE7A',
      800: '#E9A648',
      900: '#DE8D1B',
    },
  },
  elements: {
    backdrop: {
      background: {
        initial: '{color.white}',
        dark: '{color.black}',
      },
    },
    border: {
      primary: {
        default: {
          initial: '{color.gray.200}',
          dark: '{color.gray.800}',
        },
      },
    },
  },
  typography: {
    font: {
      display: 'PaytoneOne',
      body: '{font.sans}',
    },
  },
})
