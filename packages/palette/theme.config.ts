import { defineTheme } from 'pinceau'

export default defineTheme({
  media: {
    $schema: {
      title: 'Your project media queries.',
      tags: [
        '@tokenType media',
        '@icon material-symbols:screenshot-monitor-outline-rounded',
      ],
    },
    xs: '(min-width: 475px)',
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    xxl: '(min-width: 1536px)',
    rm: '(prefers-reduced-motion: reduce)',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
  },

  color: {
    $schema: {
      title: 'Your project color palette.',
      tags: [
        '@tokenType colors',
        '@icon material-symbols:palette',
      ],
    },
    white: '#ffffff',
    black: '#0E0D0D',
    primary: {
      0: {
        $initial: '$color.red.0',
        $dark: '$color.red.9',
      },
      1: {
        $initial: '$color.red.1',
        $dark: '$color.red.8',
      },
      2: {
        $initial: '$color.red.2',
        $dark: '$color.red.7',
      },
      3: {
        $initial: '$color.red.3',
        $dark: '$color.red.6',
      },
      4: {
        $initial: '$color.red.4',
        $dark: '$color.red.5',
      },
      5: {
        $initial: '$color.red.5',
        $dark: '$color.red.4',
      },
      6: {
        $initial: '$color.red.6',
        $dark: '$color.red.3',
      },
      7: {
        $initial: '$color.red.7',
        $dark: '$color.red.2',
      },
      8: {
        $initial: '$color.red.8',
        $dark: '$color.red.1',
      },
      9: {
        $initial: '$color.red.9',
        $dark: '$color.red.0',
      },
    },
    pink: {
      0: '#fdf4fc',
      1: '#fae8f9',
      2: '#f3c7f1',
      3: '#eca7e9',
      4: '#e171db',
      5: '#da52d4',
      6: '#c325bb',
      7: '#a5209f',
      8: '#851980',
      9: '#63135f',
    },
    purple: {
      0: '#f8f5fd',
      1: '#f2ebfc',
      2: '#decef7',
      3: '#ccb3f2',
      4: '#b088eb',
      5: '#a273e8',
      6: '#8a4fe2',
      7: '#7733dd',
      8: '#5f1cc4',
      9: '#471592',
    },
    blue: {
      0: '#f3f7fb',
      1: '#e8eef7',
      2: '#c6d6eb',
      3: '#a7c0e1',
      4: '#779ed0',
      5: '#608dc8',
      6: '#3a72bb',
      7: '#1e5eb1',
      8: '#0c4a9a',
      9: '#093772',
    },
    lightblue: {
      0: '#e7fafb',
      1: '#cef5f7',
      2: '#7ee5ea',
      3: '#24d2db',
      4: '#19acb3',
      5: '#179aa0',
      6: '#137d83',
      7: '#106a6e',
      8: '#0d5558',
      9: '#093f41',
    },
    seagreen: {
      0: '#e8faf4',
      1: '#d1f6ea',
      2: '#83e7c9',
      3: '#15d7a6',
      4: '#00b184',
      5: '#009f78',
      6: '#008263',
      7: '#006e55',
      8: '#005846',
      9: '#004134',
    },
    green: {
      0: '#ebfaf1',
      1: '#d5f5e2',
      2: '#94e6b4',
      3: '#51d685',
      4: '#13b351',
      5: '#11a049',
      6: '#0e823b',
      7: '#0c6e32',
      8: '#095828',
      9: '#07411e',
    },
    gray: {
      0: '#f6f6f7',
      1: '#eeeeee',
      2: '#d4d4d6',
      3: '#bebec0',
      4: '#9b9b9e',
      5: '#8b8b8f',
      6: '#717175',
      7: '#505053',
      8: '#262627',
      9: '#171717',
    },
    lime: {
      0: '#f3f9e6',
      1: '#e7f2cd',
      2: '#c4df81',
      3: '#a1cd39',
      4: '#80a81f',
      5: '#73971c',
      6: '#5d7b17',
      7: '#4f6713',
      8: '#3f530f',
      9: '#2e3d0b',
    },
    yellow: {
      0: '#fdf6e2',
      1: '#fbedc4',
      2: '#f6d168',
      3: '#e8b833',
      4: '#be952a',
      5: '#ab8525',
      6: '#8c6c1f',
      7: '#775b1a',
      8: '#604915',
      9: '#47350f',
    },
    orange: {
      0: '#fef5e8',
      1: '#feebd0',
      2: '#fdcd8a',
      3: '#fcae46',
      4: '#d78a28',
      5: '#c27b25',
      6: '#9e641f',
      7: '#86541a',
      8: '#6c4315',
      9: '#503110',
    },
    red: {
      0: '#fff4f3',
      1: '#ffe9e7',
      2: '#fec8c2',
      3: '#fda99e',
      4: '#fb705c',
      5: '#ef583f',
      6: '#c34833',
      7: '#a43d2a',
      8: '#843221',
      9: '#622518',
    },
    magenta: {
      0: '#fdf4f8',
      1: '#fce9f1',
      2: '#f7c8dc',
      3: '#f2a9c9',
      4: '#ea74a8',
      5: '#e65695',
      6: '#d42471',
      7: '#b41f60',
      8: '#91194d',
      9: '#6c123a',
    },
  },

  shadow: {
    '$schema': {
      title: 'Your project shadows.',
      tags: [
        '@tokenType shadow',
        '@icon mdi:box-shadow',
      ],
    },
    'xs': '0px 1px 2px 0px #000000',
    'sm': '0px 1px 3px 0px #000000, 0px 1px 2px -1px #000000',
    'md': '0px 4px 6px -1px #000000, 0px 2px 4px -2px #000000',
    'lg': '0px 10px 15px -3px #000000, 0px 4px 6px -4px #000000',
    'xl': '0px 20px 25px -5px $color.gray.4, 0px 8px 10px -6px #000000',
    '2xl': '0px 25px 50px -12px $color.gray.9',
    'none': '0px 0px 0px 0px transparent',
  },

  radii: {
    '$schema': {
      title: 'Your project border radiuses.',
      tags: [
        '@tokenType size',
        '@icon material-symbols:rounded-corner',
      ],
    },
    'none': '0px',
    '3xs': '2px',
    '2xs': '4px',
    'xs': '6px',
    'sm': '8px',
    'md': '10px',
    'lg': '12px',
    'xl': '14px',
    '2xl': '16px',
    '3xl': '18px',
    '4xl': '24px',
    '5xl': '28px',
    '6xl': '32px',
    'full': '9999px',
  },

  size: {
    '$schema': {
      title: 'Your project sizings.',
      tags: [
        '@tokenType size',
        '@icon ph:ruler',
      ],
    },
    '0': '0px',
    '2': '2px',
    '4': '4px',
    '6': '6px',
    '8': '8px',
    '12': '12px',
    '16': '16px',
    '20': '20px',
    '24': '24px',
    '32': '32px',
    '40': '40px',
    '48': '48px',
    '56': '56px',
    '64': '64px',
    '80': '80px',
    '104': '104px',
    '200': '200px',
    'xs': '20rem',
    'sm': '24rem',
    'md': '28rem',
    'lg': '32rem',
    'xl': '36rem',
    '2xl': '42rem',
    '3xl': '48rem',
    '4xl': '56rem',
    '5xl': '64rem',
    '6xl': '72rem',
    '7xl': '80rem',
    'full': '100%',
  },

  space: {
    $schema: {
      title: 'Your project spacings.',
      tags: [
        '@tokenType size',
        '@icon ph:ruler',
      ],
    },
    0: '0px',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    11: '2.75rem',
    12: '3rem',
    14: '3.5rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    28: '7rem',
    32: '8rem',
    36: '9rem',
    40: '10rem',
    44: '11rem',
    48: '12rem',
    52: '13rem',
    56: '14rem',
    60: '15rem',
    64: '16rem',
    72: '18rem',
    80: '20rem',
    96: '24rem',
  },

  borderWidth: {
    $schema: {
      title: 'Your project border widths.',
      tags: [
        '@tokenType size',
        '@icon material-symbols:border-all-outline-rounded',
      ],
    },
    noBorder: '0',
    sm: '1px',
    md: '2px',
    lg: '3px',
  },

  opacity: {
    $schema: {
      title: 'Your project opacities.',
      tags: [
        '@tokenType opacity',
        '@icon material-symbols:opacity',
      ],
    },
    noOpacity: '0',
    bright: '0.1',
    light: '0.15',
    soft: '0.3',
    medium: '0.5',
    high: '0.8',
    total: '1',
  },

  font: {
    $schema: {
      title: 'Your project fonts',
      tags: [
        '@tokenType font',
        '@icon material-symbols:font-download-rounded',
      ],
    },
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
    serif: 'ui-serif, Georgia, Cambria, Times New Roman, Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
  },
  fontWeight: {
    $schema: {
      title: 'Your project font weights.',
      tags: [
        '@tokenType font-weight',
        '@icon radix-icons:font-style',
      ],
    },
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  fontSize: {
    '$schema': {
      title: 'Your project font sizes.',
      tags: [
        '@tokenType font-size',
        '@icon radix-icons:font-style',
      ],
    },
    'xs': '0.75rem',
    'sm': '0.875rem',
    'base': '1rem',
    'lg': '1.125rem',
    'xl': '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  letterSpacing: {
    $schema: {
      title: 'Your project letter spacings.',
      tags: [
        '@tokenType letter-spacing',
        '@icon fluent:font-space-tracking-out-24-filled',
      ],
    },
    tighter: '-0.04em',
    tight: '-0.02em',
    normal: '0em',
    wide: '0.02em',
    wider: '0.04em',
    widest: '0.08em',
  },
  lead: {
    $schema: {
      title: 'Your project line heights.',
      tags: [
        '@tokenType size',
        '@icon icon-park-outline:auto-line-height',
      ],
    },
    1: '.025rem',
    2: '.5rem',
    3: '.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  text: {
    $schema: {
      title: 'Your project text scales.',
      tags: [
        '@tokenType size',
        '@icon material-symbols:format-size-rounded',
      ],
    },
    1: {
      fontSize: '$fontSize.xs',
      lineHeight: '$lead.4',
    },
    2: {
      fontSize: '$fontSize.sm',
      lineHeight: '$lead.5',
    },
    3: {
      fontSize: '$fontSize.base',
      lineHeight: '$lead.6',
    },
    4: {
      fontSize: '$fontSize.lg',
      lineHeight: '$lead.7',
    },
    5: {
      fontSize: '$fontSize.xl',
      lineHeight: '$lead.7',
    },
    6: {
      fontSize: '$fontSize.2xl',
      lineHeight: '$lead.8',
    },
    7: {
      fontSize: '$fontSize.3xl',
      lineHeight: '$lead.9',
    },
    8: {
      fontSize: '$fontSize.4xl',
      lineHeight: '$lead.10',
    },
    9: {
      fontSize: '$fontSize.5xl',
      lineHeight: '$lead.none',
    },
    10: {
      fontSize: '$fontSize.6xl',
      lineHeight: '$lead.none',
    },
  },

  ease: {
    $schema: {},
    linear: 'cubic-bezier(0, 0, 1, 1)',
    default: {
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    sine: {
      in: 'cubic-bezier(0.12, 0, 0.39, 0)',
      out: 'cubic-bezier(0.61, 1, 0.88, 1)',
      inOut: 'cubic-bezier(0.37, 0, 0.63, 1)',
    },
    quad: {
      in: 'cubic-bezier(0.11, 0, 0.5, 0)',
      out: 'cubic-bezier(0.5, 1, 0.89, 1)',
      inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
    },
    cubic: {
      in: 'cubic-bezier(0.32, 0, 0.67, 0)',
      out: 'cubic-bezier(0.33, 1, 0.68, 1)',
      inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    },
    quart: {
      in: 'cubic-bezier(0.5, 0, 0.75, 0)',
      out: 'cubic-bezier(0.25, 1, 0.5, 1)',
      inOut: 'cubic-bezier(0.76, 0, 0.24, 1)',
    },
    quint: {
      in: 'cubic-bezier(0.64, 0, 0.78, 0)',
      out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      inOut: 'cubic-bezier(0.83, 0, 0.17, 1)',
    },
    expo: {
      in: 'cubic-bezier(0.7, 0, 0.84, 0)',
      out: 'cubic-bezier(0.16, 1, 0.3, 1)',
      inOut: 'cubic-bezier(0.87, 0, 0.13, 1)',
    },
    circ: {
      in: 'cubic-bezier(0.55, 0, 1, 0.45)',
      out: 'cubic-bezier(0, 0.55, 0.45, 1)',
      inOut: 'cubic-bezier(0.85, 0, 0.15, 1)',
    },
    back: {
      in: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
      out: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      inOut: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
    },
  },

  utils: {
    my: (value) => {
      return {
        marginTop: value,
        marginBottom: value,
      }
    },
    mx: (value) => {
      return {
        marginLeft: value,
        marginRight: value,
      }
    },
    py: (value) => {
      return {
        paddingTop: value,
        paddingBottom: value,
      }
    },
    px: (value) => {
      return {
        paddingLeft: value,
        paddingRight: value,
      }
    },
    truncate: () => ({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    }),
    lineClamp: (lines: number | string) => ({
      'overflow': 'hidden',
      'display': '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': lines,
    }),
    text: (size: keyof PinceauTheme['text']) => ({
      fontSize: `$text.${size}.fontSize`,
      lineHeight: `$text.${size}.lineHeight`,
    }),
    gradientText: (gradient: string) => ({
      '-webkit-text-fill-color': 'transparent',
      'backgroundImage': gradient,
      '-webkit-background-clip': 'text',
      'backgroundClip': 'text',
    }),
  },
})
