import { defineTheme, palette } from '../src'

export default defineTheme({
  fonts: {
    primary: {
      value: 'Inter, sans-serif',
    },
  },

  colors: {
    primary: palette('#51BBFE'),
    grape: {
      value: '#cdb4db',
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
    'sm': { value: '640px' },
    'md': { value: '768px' },
    'lg': { value: '1024px' },
    'xl': { value: '1280px' },
    '2xl': { value: '1536px' },
  },

  shadows: {
    'xs': {
      value: {
        color: '{colors.grape}',
        type: 'dropShadow',
        x: '0',
        y: '1',
        blur: '2',
        spread: '0',
      },
    },
    'sm': {
      value: [
        {
          color: '{colors.grape}',
          type: 'dropShadow',
          x: '0',
          y: '1',
          blur: '2',
          spread: '-1',
        },
        {
          color: '{colors.grape}',
          type: 'dropShadow',
          x: '0',
          y: '1',
          blur: '3',
          spread: '0',
        },
      ],
    },
    'md': {
      value: [
        {
          color: '{colors.grape}',
          type: 'dropShadow',
          x: '0',
          y: '2',
          blur: '4',
          spread: '-2',
        },
        {
          color: '{colors.grape}',
          type: 'dropShadow',
          x: '0',
          y: '4',
          blur: '6',
          spread: '-1',
        },
      ],
    },
    'lg': {
      value: [
        {
          color: '{colors.grape}',
          type: 'dropShadow',
          x: '0',
          y: '4',
          blur: '6',
          spread: '-4',
        },
        {
          color: '{colors.grape}',
          type: 'dropShadow',
          x: '0',
          y: '10',
          blur: '15',
          spread: '-3',
        },
      ],
    },
    'xl': {
      value: [
        {
          color: '{colors.grape}',
          type: 'dropShadow',
          x: '0',
          y: '8',
          blur: '10',
          spread: '-6',
        },
        {
          color: '{colors.grape}',
          type: 'dropShadow',
          x: '0',
          y: '20',
          blur: '25',
          spread: '-5',
        },
      ],
    },
    '2xl': {
      value: {
        color: '{colors.grape}',
        type: 'dropShadow',
        x: '0',
        y: '25',
        blur: '50',
        spread: '-12',
      },
    },
  },
})
