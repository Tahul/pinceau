import { defineTheme, palette } from '../../src'

export default defineTheme({
  media: {
    'sm': { value: '(min-width: 640px)' },
    'md': { value: '(min-width: 768px)' },
    'lg': { value: '(min-width: 1024px)' },
    'xl': { value: '(min-width: 1280px)' },
    '2xl': { value: '(min-width: 1536px)' },
  },

  fonts: {
    primary: {
      value: 'Inter, sans-serif',
    },
    code: {
      value: '\'Fira Code\', monospace',
    },
  },

  colors: {
    primary: palette('#51BBFE'),

    grape: palette('#cdb4db'),

    lila: palette('#BB9BB0'),

    gray: palette('#71717A'),

    lavender: palette('#F1E3E4'),

    velvet: palette('#502274'),
  },

  shadows: {
    'xs': {
      value: {
        color: '{colors.gray.800}',
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
          color: '{colors.gray.800}',
          type: 'dropShadow',
          x: '0',
          y: '1',
          blur: '2',
          spread: '-1',
        },
        {
          color: '{colors.gray.800}',
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
          color: '{colors.gray.800}',
          type: 'dropShadow',
          x: '0',
          y: '2',
          blur: '4',
          spread: '-2',
        },
        {
          color: '{colors.gray.800}',
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
          color: '{colors.gray.800}',
          type: 'dropShadow',
          x: '0',
          y: '4',
          blur: '6',
          spread: '-4',
        },
        {
          color: '{colors.gray.800}',
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
          color: '{colors.gray.800}',
          type: 'dropShadow',
          x: '0',
          y: '8',
          blur: '10',
          spread: '-6',
        },
        {
          color: '{colors.gray.800}',
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
        color: '{colors.gray.800}',
        type: 'dropShadow',
        x: '0',
        y: '25',
        blur: '50',
        spread: '-12',
      },
    },
  },

  fontWeights: {
    thin: {
      value: 100,
    },
    extralight: {
      value: 200,
    },
    light: {
      value: 300,
    },
    normal: {
      value: 400,
    },
    medium: {
      value: 500,
    },
    semibold: {
      value: 600,
    },
    bold: {
      value: 700,
    },
    extrabold: {
      value: 800,
    },
    black: {
      value: 900,
    },
  },

  fontSizes: {
    'xs': {
      value: '12px',
    },
    'sm': {
      value: '14px',
    },
    'base': {
      value: '16px',
    },
    'lg': {
      value: '18px',
    },
    'xl': {
      value: '20px',
    },
    '2xl': {
      value: '24px',
    },
    '3xl': {
      value: '30px',
    },
    '4xl': {
      value: '36px',
    },
    '5xl': {
      value: '48px',
    },
    '6xl': {
      value: '60px',
    },
    '7xl': {
      value: '72px',
    },
    '8xl': {
      value: '96px',
    },
    '9xl': {
      value: '128px',
    },
  },

  letterSpacings: {
    tighter: {
      value: '-.05em',
    },
    tight: {
      value: '-0025em',
    },
    normal: {
      value: '0em',
    },
    wide: {
      value: '0025em',
    },
    wider: {
      value: '.05em',
    },
    widest: {
      value: '0.1em',
    },
  },

  leads: {
    none: {
      value: 1,
    },
    tight: {
      value: 1.25,
    },
    snug: {
      value: 1.375,
    },
    normal: {
      value: 1.5,
    },
    relaxed: {
      value: 1.625,
    },
    loose: {
      value: 2,
    },
  },

  radii: {
    '2xs': {
      value: '0.125rem',
    },
    'xs': {
      value: '0.25rem',
    },
    'sm': {
      value: '0.375rem',
    },
    'md': {
      value: '0.5rem',
    },
    'lg': {
      value: '0.75rem',
    },
    'xl': {
      value: '1rem',
    },
    '2xl': {
      value: '1.5rem',
    },
    'full': {
      value: '9999px',
    },
  },

  size: {
    4: {
      value: '4px',
    },
    6: {
      value: '6px',
    },
    8: {
      value: '8px',
    },
    12: {
      value: '12px',
    },
    16: {
      value: '16px',
    },
    20: {
      value: '20px',
    },
    24: {
      value: '24px',
    },
    32: {
      value: '32px',
    },
    40: {
      value: '40px',
    },
    48: {
      value: '48px',
    },
    56: {
      value: '56px',
    },
    64: {
      value: '64px',
    },
    80: {
      value: '80px',
    },
    104: {
      value: '104px',
    },
    200: {
      value: '200px',
    },
  },
  space: {
    0: {
      value: '0',
    },
    1: {
      value: '1px',
    },
    2: {
      value: '2px',
    },
    4: {
      value: '4px',
    },
    6: {
      value: '6px',
    },
    8: {
      value: '8px',
    },
    10: {
      value: '10px',
    },
    12: {
      value: '12px',
    },
    16: {
      value: '16px',
    },
    20: {
      value: '20px',
    },
    24: {
      value: '24px',
    },
    32: {
      value: '32px',
    },
    40: {
      value: '40px',
    },
    44: {
      value: '44px',
    },
    48: {
      value: '48px',
    },
    56: {
      value: '56px',
    },
    64: {
      value: '64px',
    },
    80: {
      value: '80px',
    },
    104: {
      value: '104px',
    },
    140: {
      value: '140px',
    },
    200: {
      value: '200px',
    },
  },
  borderWidths: {
    noBorder: {
      value: '0',
    },
    sm: {
      value: '1px',
    },
    md: {
      value: '2px',
    },
    lg: {
      value: '3px',
    },
  },
  opacity: {
    noOpacity: {
      value: '0',
    },
    bright: {
      value: '0.1',
    },
    light: {
      value: '0.15',
    },
    soft: {
      value: '0.3',
    },
    medium: {
      value: '0.5',
    },
    high: {
      value: '0.8',
    },
    total: {
      value: '1',
    },
  },

  zIndices: {
    0: {
      value: '0',
    },
    1: {
      value: '1px',
    },
    2: {
      value: '2px',
    },
    4: {
      value: '4px',
    },
    6: {
      value: '6px',
    },
    8: {
      value: '8px',
    },
    10: {
      value: '10px',
    },
    12: {
      value: '12px',
    },
    16: {
      value: '16px',
    },
    20: {
      value: '20px',
    },
    24: {
      value: '24px',
    },
    32: {
      value: '32px',
    },
    40: {
      value: '40px',
    },
    44: {
      value: '44px',
    },
    48: {
      value: '48px',
    },
    56: {
      value: '56px',
    },
    64: {
      value: '64px',
    },
    80: {
      value: '80px',
    },
    104: {
      value: '104px',
    },
    140: {
      value: '140px',
    },
    200: {
      value: '200px',
    },
  },
})
