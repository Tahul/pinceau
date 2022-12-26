import { defineTheme, palette } from '../../src'

export default defineTheme({
  media: {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    xxl: '(min-width: 1536px)',
  },

  font: {
    primary: 'Inter, sans-serif',
    secondary: 'FredokaOne, serif',
  },

  color: {
    white: '#FFFFFF',
    black: '#191919',
    pink: palette('#EC528D'),
    blue: palette('#2B9EB3'),
    yellow: palette('#FCAB10'),
    red: palette('#F8333C'),
    grey: palette('#DBD5B5'),
    green: palette('#44AF69'),
    primary: {
      100: {
        initial: '{color.blue.100}',
        dark: '{color.blue.900}',
      },
      200: {
        initial: '{color.blue.200}',
        dark: '{color.blue.800}',
      },
      300: {
        initial: '{color.blue.300}',
        dark: '{color.blue.700}',
      },
      400: {
        initial: '{color.blue.400}',
        dark: '{color.blue.600}',
      },
      500: {
        initial: '{color.blue.500}',
        dark: '{color.blue.500}',
      },
      600: {
        initial: '{color.blue.600}',
        dark: '{color.blue.400}',
      },
      700: {
        initial: '{color.blue.700}',
        dark: '{color.blue.300}',
      },
      800: {
        initial: '{color.blue.800}',
        dark: '{color.blue.200}',
      },
      900: {
        initial: '{color.blue.900}',
        dark: '{color.blue.100}',
      },
    },
  },

  shadow: {
    xs: '0 1px 2px 0 {color.grey.800}',
    sm: '0 1px 2px -1px {color.grey.800}, 0 1px 3px 0 {color.grey.800}',
    md: '0 2px 4px -2px {color.grey.800}, 0 4px 6px -1px {color.grey.800}',
    lg: '0 4px 6px -4px {color.grey.800}, 0 10px 15px -3px {color.grey.800}',
    xl: '0 8px 10px -6px {color.grey.800}, 0 20px 25px -5px {color.grey.800}',
    xxl: '0 25px 50px -12px {color.grey.800}',
  },

  fontWeight: {
    thin: 100,
    extralight: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  fontSize: {
    'xs': '12px',
    'sm': '14px',
    'base': '16px',
    'lg': '18px',
    'xl': '20px',
    'xxl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
    '6xl': '60px',
    '7xl': '72px',
    '8xl': '96px',
    '9xl': '128px',
  },

  letterSpacing: {
    tighter: '-.05em',
    tight: '-0025em',
    normal: '0em',
    wide: '0025em',
    wider: '.05em',
    widest: '0.1em',
  },

  lead: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  radii: {
    '2xs': '0.125rem',
    'xs': '0.25rem',
    'sm': '0.375rem',
    'md': '0.5rem',
    'lg': '1rem',
    'xl': '1rem',
    'xxl': '1.5rem',
    'full': '9999px',
  },

  size: {
    4: '4px',
    6: '6px',
    8: '8px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    200: '200px',
  },

  space: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    6: '6px',
    8: '8px',
    10: '10px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    44: '44px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    140: '140px',
    200: '200px',
  },

  borderWidth: {
    noBorder: '0',
    sm: '1px',
    md: '2px',
    lg: '3px',
  },

  opacity: {
    noOpacity: '0',
    bright: '0.1',
    light: '0.15',
    soft: '0.3',
    medium: '0.5',
    high: '0.8',
    total: '1',
  },

  zIndex: {
    0: '0',
    1: '1px',
    2: '2px',
    4: '4px',
    6: '6px',
    8: '8px',
    10: '10px',
    12: '12px',
    16: '16px',
    20: '20px',
    24: '24px',
    32: '32px',
    40: '40px',
    44: '44px',
    48: '48px',
    56: '56px',
    64: '64px',
    80: '80px',
    104: '104px',
    140: '140px',
    200: '200px',
  },

  utils: {
    my: value => ({ marginTop: value, marginBottom: value }),
    mx: value => ({ marginLeft: value, marginRight: value }),
    px: value => ({ paddingLeft: value, paddingRight: value }),
    py: value => ({ paddingTop: value, paddingBottom: value }),
    pt: value => ({ paddingTop: value }),
    truncate: {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    stateColors: (value: string) => {
      return {
        color: `{color.${value}.500}`,
        backgroundColor: `{color.${value}.200}`,
      }
    },
  },
})
