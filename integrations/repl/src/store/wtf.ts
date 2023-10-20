const __module__ = __modules__['@pinceau/outputs/theme'] = { [Symbol.toStringTag]: 'Module' }

const theme = {
  media: {
    xs: {
      value: '(min-width: 475px)',
      variable: 'var(--media-xs)',
    },
    sm: {
      value: '(min-width: 640px)',
      variable: 'var(--media-sm)',
    },
    md: {
      value: '(min-width: 768px)',
      variable: 'var(--media-md)',
    },
    lg: {
      value: '(min-width: 1024px)',
      variable: 'var(--media-lg)',
    },
    xl: {
      value: '(min-width: 1280px)',
      variable: 'var(--media-xl)',
    },
    xxl: {
      value: '(min-width: 1536px)',
      variable: 'var(--media-xxl)',
    },
    rm: {
      value: '(prefers-reduced-motion: reduce)',
      variable: 'var(--media-rm)',
    },
    landscape: {
      value: 'only screen and (orientation: landscape)',
      variable: 'var(--media-landscape)',
    },
    portrait: {
      value: 'only screen and (orientation: portrait)',
      variable: 'var(--media-portrait)',
    },
  },
  color: {
    white: {
      value: '#ffffff',
      variable: 'var(--color-white)',
    },
    black: {
      value: '#0E0D0D',
      variable: 'var(--color-black)',
    },
    primary: {
      0: {
        value: {
          $initial: 'var(--color-red-0)',
          $dark: 'var(--color-red-9)',
        },
        variable: 'var(--color-primary-0)',
      },
      1: {
        value: {
          $initial: 'var(--color-red-1)',
          $dark: 'var(--color-red-8)',
        },
        variable: 'var(--color-primary-1)',
      },
      2: {
        value: {
          $initial: 'var(--color-red-2)',
          $dark: 'var(--color-red-7)',
        },
        variable: 'var(--color-primary-2)',
      },
      3: {
        value: {
          $initial: 'var(--color-red-3)',
          $dark: 'var(--color-red-6)',
        },
        variable: 'var(--color-primary-3)',
      },
      4: {
        value: {
          $initial: 'var(--color-red-4)',
          $dark: 'var(--color-red-5)',
        },
        variable: 'var(--color-primary-4)',
      },
      5: {
        value: {
          $initial: 'var(--color-red-5)',
          $dark: 'var(--color-red-4)',
        },
        variable: 'var(--color-primary-5)',
      },
      6: {
        value: {
          $initial: 'var(--color-red-6)',
          $dark: 'var(--color-red-3)',
        },
        variable: 'var(--color-primary-6)',
      },
      7: {
        value: {
          $initial: 'var(--color-red-7)',
          $dark: 'var(--color-red-2)',
        },
        variable: 'var(--color-primary-7)',
      },
      8: {
        value: {
          $initial: 'var(--color-red-8)',
          $dark: 'var(--color-red-1)',
        },
        variable: 'var(--color-primary-8)',
      },
      9: {
        value: {
          $initial: 'var(--color-red-9)',
          $dark: 'var(--color-red-0)',
        },
        variable: 'var(--color-primary-9)',
      },
    },
    pink: {
      0: {
        value: '#fdf4fc',
        variable: 'var(--color-pink-0)',
      },
      1: {
        value: '#fae8f9',
        variable: 'var(--color-pink-1)',
      },
      2: {
        value: '#f3c7f1',
        variable: 'var(--color-pink-2)',
      },
      3: {
        value: '#eca7e9',
        variable: 'var(--color-pink-3)',
      },
      4: {
        value: '#e171db',
        variable: 'var(--color-pink-4)',
      },
      5: {
        value: '#da52d4',
        variable: 'var(--color-pink-5)',
      },
      6: {
        value: '#c325bb',
        variable: 'var(--color-pink-6)',
      },
      7: {
        value: '#a5209f',
        variable: 'var(--color-pink-7)',
      },
      8: {
        value: '#851980',
        variable: 'var(--color-pink-8)',
      },
      9: {
        value: '#63135f',
        variable: 'var(--color-pink-9)',
      },
    },
    purple: {
      0: {
        value: '#f8f5fd',
        variable: 'var(--color-purple-0)',
      },
      1: {
        value: '#f2ebfc',
        variable: 'var(--color-purple-1)',
      },
      2: {
        value: '#decef7',
        variable: 'var(--color-purple-2)',
      },
      3: {
        value: '#ccb3f2',
        variable: 'var(--color-purple-3)',
      },
      4: {
        value: '#b088eb',
        variable: 'var(--color-purple-4)',
      },
      5: {
        value: '#a273e8',
        variable: 'var(--color-purple-5)',
      },
      6: {
        value: '#8a4fe2',
        variable: 'var(--color-purple-6)',
      },
      7: {
        value: '#7733dd',
        variable: 'var(--color-purple-7)',
      },
      8: {
        value: '#5f1cc4',
        variable: 'var(--color-purple-8)',
      },
      9: {
        value: '#471592',
        variable: 'var(--color-purple-9)',
      },
    },
    blue: {
      0: {
        value: '#f3f7fb',
        variable: 'var(--color-blue-0)',
      },
      1: {
        value: '#e8eef7',
        variable: 'var(--color-blue-1)',
      },
      2: {
        value: '#c6d6eb',
        variable: 'var(--color-blue-2)',
      },
      3: {
        value: '#a7c0e1',
        variable: 'var(--color-blue-3)',
      },
      4: {
        value: '#779ed0',
        variable: 'var(--color-blue-4)',
      },
      5: {
        value: '#608dc8',
        variable: 'var(--color-blue-5)',
      },
      6: {
        value: '#3a72bb',
        variable: 'var(--color-blue-6)',
      },
      7: {
        value: '#1e5eb1',
        variable: 'var(--color-blue-7)',
      },
      8: {
        value: '#0c4a9a',
        variable: 'var(--color-blue-8)',
      },
      9: {
        value: '#093772',
        variable: 'var(--color-blue-9)',
      },
    },
    lightblue: {
      0: {
        value: '#e7fafb',
        variable: 'var(--color-lightblue-0)',
      },
      1: {
        value: '#cef5f7',
        variable: 'var(--color-lightblue-1)',
      },
      2: {
        value: '#7ee5ea',
        variable: 'var(--color-lightblue-2)',
      },
      3: {
        value: '#24d2db',
        variable: 'var(--color-lightblue-3)',
      },
      4: {
        value: '#19acb3',
        variable: 'var(--color-lightblue-4)',
      },
      5: {
        value: '#179aa0',
        variable: 'var(--color-lightblue-5)',
      },
      6: {
        value: '#137d83',
        variable: 'var(--color-lightblue-6)',
      },
      7: {
        value: '#106a6e',
        variable: 'var(--color-lightblue-7)',
      },
      8: {
        value: '#0d5558',
        variable: 'var(--color-lightblue-8)',
      },
      9: {
        value: '#093f41',
        variable: 'var(--color-lightblue-9)',
      },
    },
    seagreen: {
      0: {
        value: '#e8faf4',
        variable: 'var(--color-seagreen-0)',
      },
      1: {
        value: '#d1f6ea',
        variable: 'var(--color-seagreen-1)',
      },
      2: {
        value: '#83e7c9',
        variable: 'var(--color-seagreen-2)',
      },
      3: {
        value: '#15d7a6',
        variable: 'var(--color-seagreen-3)',
      },
      4: {
        value: '#00b184',
        variable: 'var(--color-seagreen-4)',
      },
      5: {
        value: '#009f78',
        variable: 'var(--color-seagreen-5)',
      },
      6: {
        value: '#008263',
        variable: 'var(--color-seagreen-6)',
      },
      7: {
        value: '#006e55',
        variable: 'var(--color-seagreen-7)',
      },
      8: {
        value: '#005846',
        variable: 'var(--color-seagreen-8)',
      },
      9: {
        value: '#004134',
        variable: 'var(--color-seagreen-9)',
      },
    },
    green: {
      0: {
        value: '#ebfaf1',
        variable: 'var(--color-green-0)',
      },
      1: {
        value: '#d5f5e2',
        variable: 'var(--color-green-1)',
      },
      2: {
        value: '#94e6b4',
        variable: 'var(--color-green-2)',
      },
      3: {
        value: '#51d685',
        variable: 'var(--color-green-3)',
      },
      4: {
        value: '#13b351',
        variable: 'var(--color-green-4)',
      },
      5: {
        value: '#11a049',
        variable: 'var(--color-green-5)',
      },
      6: {
        value: '#0e823b',
        variable: 'var(--color-green-6)',
      },
      7: {
        value: '#0c6e32',
        variable: 'var(--color-green-7)',
      },
      8: {
        value: '#095828',
        variable: 'var(--color-green-8)',
      },
      9: {
        value: '#07411e',
        variable: 'var(--color-green-9)',
      },
    },
    gray: {
      0: {
        value: '#f6f6f7',
        variable: 'var(--color-gray-0)',
      },
      1: {
        value: '#eeeeee',
        variable: 'var(--color-gray-1)',
      },
      2: {
        value: '#d4d4d6',
        variable: 'var(--color-gray-2)',
      },
      3: {
        value: '#bebec0',
        variable: 'var(--color-gray-3)',
      },
      4: {
        value: '#9b9b9e',
        variable: 'var(--color-gray-4)',
      },
      5: {
        value: '#8b8b8f',
        variable: 'var(--color-gray-5)',
      },
      6: {
        value: '#717175',
        variable: 'var(--color-gray-6)',
      },
      7: {
        value: '#505053',
        variable: 'var(--color-gray-7)',
      },
      8: {
        value: '#262627',
        variable: 'var(--color-gray-8)',
      },
      9: {
        value: '#171717',
        variable: 'var(--color-gray-9)',
      },
    },
    lime: {
      0: {
        value: '#f3f9e6',
        variable: 'var(--color-lime-0)',
      },
      1: {
        value: '#e7f2cd',
        variable: 'var(--color-lime-1)',
      },
      2: {
        value: '#c4df81',
        variable: 'var(--color-lime-2)',
      },
      3: {
        value: '#a1cd39',
        variable: 'var(--color-lime-3)',
      },
      4: {
        value: '#80a81f',
        variable: 'var(--color-lime-4)',
      },
      5: {
        value: '#73971c',
        variable: 'var(--color-lime-5)',
      },
      6: {
        value: '#5d7b17',
        variable: 'var(--color-lime-6)',
      },
      7: {
        value: '#4f6713',
        variable: 'var(--color-lime-7)',
      },
      8: {
        value: '#3f530f',
        variable: 'var(--color-lime-8)',
      },
      9: {
        value: '#2e3d0b',
        variable: 'var(--color-lime-9)',
      },
    },
    yellow: {
      0: {
        value: '#fdf6e2',
        variable: 'var(--color-yellow-0)',
      },
      1: {
        value: '#fbedc4',
        variable: 'var(--color-yellow-1)',
      },
      2: {
        value: '#f6d168',
        variable: 'var(--color-yellow-2)',
      },
      3: {
        value: '#e8b833',
        variable: 'var(--color-yellow-3)',
      },
      4: {
        value: '#be952a',
        variable: 'var(--color-yellow-4)',
      },
      5: {
        value: '#ab8525',
        variable: 'var(--color-yellow-5)',
      },
      6: {
        value: '#8c6c1f',
        variable: 'var(--color-yellow-6)',
      },
      7: {
        value: '#775b1a',
        variable: 'var(--color-yellow-7)',
      },
      8: {
        value: '#604915',
        variable: 'var(--color-yellow-8)',
      },
      9: {
        value: '#47350f',
        variable: 'var(--color-yellow-9)',
      },
    },
    orange: {
      0: {
        value: '#fef5e8',
        variable: 'var(--color-orange-0)',
      },
      1: {
        value: '#feebd0',
        variable: 'var(--color-orange-1)',
      },
      2: {
        value: '#fdcd8a',
        variable: 'var(--color-orange-2)',
      },
      3: {
        value: '#fcae46',
        variable: 'var(--color-orange-3)',
      },
      4: {
        value: '#d78a28',
        variable: 'var(--color-orange-4)',
      },
      5: {
        value: '#c27b25',
        variable: 'var(--color-orange-5)',
      },
      6: {
        value: '#9e641f',
        variable: 'var(--color-orange-6)',
      },
      7: {
        value: '#86541a',
        variable: 'var(--color-orange-7)',
      },
      8: {
        value: '#6c4315',
        variable: 'var(--color-orange-8)',
      },
      9: {
        value: '#503110',
        variable: 'var(--color-orange-9)',
      },
    },
    red: {
      0: {
        value: '#fff4f3',
        variable: 'var(--color-red-0)',
      },
      1: {
        value: '#ffe9e7',
        variable: 'var(--color-red-1)',
      },
      2: {
        value: '#fec8c2',
        variable: 'var(--color-red-2)',
      },
      3: {
        value: '#fda99e',
        variable: 'var(--color-red-3)',
      },
      4: {
        value: '#fb705c',
        variable: 'var(--color-red-4)',
      },
      5: {
        value: '#ef583f',
        variable: 'var(--color-red-5)',
      },
      6: {
        value: '#c34833',
        variable: 'var(--color-red-6)',
      },
      7: {
        value: '#a43d2a',
        variable: 'var(--color-red-7)',
      },
      8: {
        value: '#843221',
        variable: 'var(--color-red-8)',
      },
      9: {
        value: '#622518',
        variable: 'var(--color-red-9)',
      },
    },
    magenta: {
      0: {
        value: '#fdf4f8',
        variable: 'var(--color-magenta-0)',
      },
      1: {
        value: '#fce9f1',
        variable: 'var(--color-magenta-1)',
      },
      2: {
        value: '#f7c8dc',
        variable: 'var(--color-magenta-2)',
      },
      3: {
        value: '#f2a9c9',
        variable: 'var(--color-magenta-3)',
      },
      4: {
        value: '#ea74a8',
        variable: 'var(--color-magenta-4)',
      },
      5: {
        value: '#e65695',
        variable: 'var(--color-magenta-5)',
      },
      6: {
        value: '#d42471',
        variable: 'var(--color-magenta-6)',
      },
      7: {
        value: '#b41f60',
        variable: 'var(--color-magenta-7)',
      },
      8: {
        value: '#91194d',
        variable: 'var(--color-magenta-8)',
      },
      9: {
        value: '#6c123a',
        variable: 'var(--color-magenta-9)',
      },
    },
  },
  shadow: {
    'xs': {
      value: '0px 1px 2px 0px #000000',
      variable: 'var(--shadow-xs)',
    },
    'sm': {
      value: '0px 1px 3px 0px #000000, 0px 1px 2px -1px #000000',
      variable: 'var(--shadow-sm)',
    },
    'md': {
      value: '0px 4px 6px -1px #000000, 0px 2px 4px -2px #000000',
      variable: 'var(--shadow-md)',
    },
    'lg': {
      value: '0px 10px 15px -3px #000000, 0px 4px 6px -4px #000000',
      variable: 'var(--shadow-lg)',
    },
    'xl': {
      value: '0px 20px 25px -5px var(--color-gray-4), 0px 8px 10px -6px #000000',
      variable: 'var(--shadow-xl)',
    },
    '2xl': {
      value: '0px 25px 50px -12px var(--color-gray-9)',
      variable: 'var(--shadow-2xl)',
    },
    'none': {
      value: '0px 0px 0px 0px transparent',
      variable: 'var(--shadow-none)',
    },
  },
  radii: {
    'none': {
      value: '0px',
      variable: 'var(--radii-none)',
    },
    '3xs': {
      value: '2px',
      variable: 'var(--radii-3xs)',
    },
    '2xs': {
      value: '4px',
      variable: 'var(--radii-2xs)',
    },
    'xs': {
      value: '6px',
      variable: 'var(--radii-xs)',
    },
    'sm': {
      value: '8px',
      variable: 'var(--radii-sm)',
    },
    'md': {
      value: '10px',
      variable: 'var(--radii-md)',
    },
    'lg': {
      value: '12px',
      variable: 'var(--radii-lg)',
    },
    'xl': {
      value: '14px',
      variable: 'var(--radii-xl)',
    },
    '2xl': {
      value: '16px',
      variable: 'var(--radii-2xl)',
    },
    '3xl': {
      value: '18px',
      variable: 'var(--radii-3xl)',
    },
    '4xl': {
      value: '24px',
      variable: 'var(--radii-4xl)',
    },
    '5xl': {
      value: '28px',
      variable: 'var(--radii-5xl)',
    },
    '6xl': {
      value: '32px',
      variable: 'var(--radii-6xl)',
    },
    'full': {
      value: '9999px',
      variable: 'var(--radii-full)',
    },
  },
  size: {
    '0': {
      value: '0px',
      variable: 'var(--size-0)',
    },
    '2': {
      value: '2px',
      variable: 'var(--size-2)',
    },
    '4': {
      value: '4px',
      variable: 'var(--size-4)',
    },
    '6': {
      value: '6px',
      variable: 'var(--size-6)',
    },
    '8': {
      value: '8px',
      variable: 'var(--size-8)',
    },
    '12': {
      value: '12px',
      variable: 'var(--size-12)',
    },
    '16': {
      value: '16px',
      variable: 'var(--size-16)',
    },
    '20': {
      value: '20px',
      variable: 'var(--size-20)',
    },
    '24': {
      value: '24px',
      variable: 'var(--size-24)',
    },
    '32': {
      value: '32px',
      variable: 'var(--size-32)',
    },
    '40': {
      value: '40px',
      variable: 'var(--size-40)',
    },
    '48': {
      value: '48px',
      variable: 'var(--size-48)',
    },
    '56': {
      value: '56px',
      variable: 'var(--size-56)',
    },
    '64': {
      value: '64px',
      variable: 'var(--size-64)',
    },
    '80': {
      value: '80px',
      variable: 'var(--size-80)',
    },
    '104': {
      value: '104px',
      variable: 'var(--size-104)',
    },
    '200': {
      value: '200px',
      variable: 'var(--size-200)',
    },
    'xs': {
      value: '20rem',
      variable: 'var(--size-xs)',
    },
    'sm': {
      value: '24rem',
      variable: 'var(--size-sm)',
    },
    'md': {
      value: '28rem',
      variable: 'var(--size-md)',
    },
    'lg': {
      value: '32rem',
      variable: 'var(--size-lg)',
    },
    'xl': {
      value: '36rem',
      variable: 'var(--size-xl)',
    },
    '2xl': {
      value: '42rem',
      variable: 'var(--size-2xl)',
    },
    '3xl': {
      value: '48rem',
      variable: 'var(--size-3xl)',
    },
    '4xl': {
      value: '56rem',
      variable: 'var(--size-4xl)',
    },
    '5xl': {
      value: '64rem',
      variable: 'var(--size-5xl)',
    },
    '6xl': {
      value: '72rem',
      variable: 'var(--size-6xl)',
    },
    '7xl': {
      value: '80rem',
      variable: 'var(--size-7xl)',
    },
    'full': {
      value: '100%',
      variable: 'var(--size-full)',
    },
  },
  space: {
    0: {
      value: '0px',
      variable: 'var(--space-0)',
    },
    1: {
      value: '0.25rem',
      variable: 'var(--space-1)',
    },
    2: {
      value: '0.5rem',
      variable: 'var(--space-2)',
    },
    3: {
      value: '0.75rem',
      variable: 'var(--space-3)',
    },
    4: {
      value: '1rem',
      variable: 'var(--space-4)',
    },
    5: {
      value: '1.25rem',
      variable: 'var(--space-5)',
    },
    6: {
      value: '1.5rem',
      variable: 'var(--space-6)',
    },
    7: {
      value: '1.75rem',
      variable: 'var(--space-7)',
    },
    8: {
      value: '2rem',
      variable: 'var(--space-8)',
    },
    9: {
      value: '2.25rem',
      variable: 'var(--space-9)',
    },
    10: {
      value: '2.5rem',
      variable: 'var(--space-10)',
    },
    11: {
      value: '2.75rem',
      variable: 'var(--space-11)',
    },
    12: {
      value: '3rem',
      variable: 'var(--space-12)',
    },
    14: {
      value: '3.5rem',
      variable: 'var(--space-14)',
    },
    16: {
      value: '4rem',
      variable: 'var(--space-16)',
    },
    20: {
      value: '5rem',
      variable: 'var(--space-20)',
    },
    24: {
      value: '6rem',
      variable: 'var(--space-24)',
    },
    28: {
      value: '7rem',
      variable: 'var(--space-28)',
    },
    32: {
      value: '8rem',
      variable: 'var(--space-32)',
    },
    36: {
      value: '9rem',
      variable: 'var(--space-36)',
    },
    40: {
      value: '10rem',
      variable: 'var(--space-40)',
    },
    44: {
      value: '11rem',
      variable: 'var(--space-44)',
    },
    48: {
      value: '12rem',
      variable: 'var(--space-48)',
    },
    52: {
      value: '13rem',
      variable: 'var(--space-52)',
    },
    56: {
      value: '14rem',
      variable: 'var(--space-56)',
    },
    60: {
      value: '15rem',
      variable: 'var(--space-60)',
    },
    64: {
      value: '16rem',
      variable: 'var(--space-64)',
    },
    72: {
      value: '18rem',
      variable: 'var(--space-72)',
    },
    80: {
      value: '20rem',
      variable: 'var(--space-80)',
    },
    96: {
      value: '24rem',
      variable: 'var(--space-96)',
    },
  },
  borderWidth: {
    noBorder: {
      value: '0',
      variable: 'var(--borderWidth-noBorder)',
    },
    sm: {
      value: '1px',
      variable: 'var(--borderWidth-sm)',
    },
    md: {
      value: '2px',
      variable: 'var(--borderWidth-md)',
    },
    lg: {
      value: '3px',
      variable: 'var(--borderWidth-lg)',
    },
  },
  opacity: {
    noOpacity: {
      value: '0',
      variable: 'var(--opacity-noOpacity)',
    },
    bright: {
      value: '0.1',
      variable: 'var(--opacity-bright)',
    },
    light: {
      value: '0.15',
      variable: 'var(--opacity-light)',
    },
    soft: {
      value: '0.3',
      variable: 'var(--opacity-soft)',
    },
    medium: {
      value: '0.5',
      variable: 'var(--opacity-medium)',
    },
    high: {
      value: '0.8',
      variable: 'var(--opacity-high)',
    },
    total: {
      value: '1',
      variable: 'var(--opacity-total)',
    },
  },
  font: {
    sans: {
      value: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
      variable: 'var(--font-sans)',
    },
    serif: {
      value: 'ui-serif, Georgia, Cambria, Times New Roman, Times, serif',
      variable: 'var(--font-serif)',
    },
    mono: {
      value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
      variable: 'var(--font-mono)',
    },
  },
  fontWeight: {
    thin: {
      value: '100',
      variable: 'var(--fontWeight-thin)',
    },
    extralight: {
      value: '200',
      variable: 'var(--fontWeight-extralight)',
    },
    light: {
      value: '300',
      variable: 'var(--fontWeight-light)',
    },
    normal: {
      value: '400',
      variable: 'var(--fontWeight-normal)',
    },
    medium: {
      value: '500',
      variable: 'var(--fontWeight-medium)',
    },
    semibold: {
      value: '600',
      variable: 'var(--fontWeight-semibold)',
    },
    bold: {
      value: '700',
      variable: 'var(--fontWeight-bold)',
    },
    extrabold: {
      value: '800',
      variable: 'var(--fontWeight-extrabold)',
    },
    black: {
      value: '900',
      variable: 'var(--fontWeight-black)',
    },
  },
  fontSize: {
    'xs': {
      value: '0.75rem',
      variable: 'var(--fontSize-xs)',
    },
    'sm': {
      value: '0.875rem',
      variable: 'var(--fontSize-sm)',
    },
    'base': {
      value: '1rem',
      variable: 'var(--fontSize-base)',
    },
    'lg': {
      value: '1.125rem',
      variable: 'var(--fontSize-lg)',
    },
    'xl': {
      value: '1.25rem',
      variable: 'var(--fontSize-xl)',
    },
    '2xl': {
      value: '1.5rem',
      variable: 'var(--fontSize-2xl)',
    },
    '3xl': {
      value: '1.875rem',
      variable: 'var(--fontSize-3xl)',
    },
    '4xl': {
      value: '2.25rem',
      variable: 'var(--fontSize-4xl)',
    },
    '5xl': {
      value: '3rem',
      variable: 'var(--fontSize-5xl)',
    },
    '6xl': {
      value: '3.75rem',
      variable: 'var(--fontSize-6xl)',
    },
    '7xl': {
      value: '4.5rem',
      variable: 'var(--fontSize-7xl)',
    },
    '8xl': {
      value: '6rem',
      variable: 'var(--fontSize-8xl)',
    },
    '9xl': {
      value: '8rem',
      variable: 'var(--fontSize-9xl)',
    },
  },
  letterSpacing: {
    tighter: {
      value: '-0.04em',
      variable: 'var(--letterSpacing-tighter)',
    },
    tight: {
      value: '-0.02em',
      variable: 'var(--letterSpacing-tight)',
    },
    normal: {
      value: '0em',
      variable: 'var(--letterSpacing-normal)',
    },
    wide: {
      value: '0.02em',
      variable: 'var(--letterSpacing-wide)',
    },
    wider: {
      value: '0.04em',
      variable: 'var(--letterSpacing-wider)',
    },
    widest: {
      value: '0.08em',
      variable: 'var(--letterSpacing-widest)',
    },
  },
  lead: {
    1: {
      value: '.025rem',
      variable: 'var(--lead-1)',
    },
    2: {
      value: '.5rem',
      variable: 'var(--lead-2)',
    },
    3: {
      value: '.75rem',
      variable: 'var(--lead-3)',
    },
    4: {
      value: '1rem',
      variable: 'var(--lead-4)',
    },
    5: {
      value: '1.25rem',
      variable: 'var(--lead-5)',
    },
    6: {
      value: '1.5rem',
      variable: 'var(--lead-6)',
    },
    7: {
      value: '1.75rem',
      variable: 'var(--lead-7)',
    },
    8: {
      value: '2rem',
      variable: 'var(--lead-8)',
    },
    9: {
      value: '2.25rem',
      variable: 'var(--lead-9)',
    },
    10: {
      value: '2.5rem',
      variable: 'var(--lead-10)',
    },
    none: {
      value: '1',
      variable: 'var(--lead-none)',
    },
    tight: {
      value: '1.25',
      variable: 'var(--lead-tight)',
    },
    snug: {
      value: '1.375',
      variable: 'var(--lead-snug)',
    },
    normal: {
      value: '1.5',
      variable: 'var(--lead-normal)',
    },
    relaxed: {
      value: '1.625',
      variable: 'var(--lead-relaxed)',
    },
    loose: {
      value: '2',
      variable: 'var(--lead-loose)',
    },
  },
  text: {
    1: {
      fontSize: {
        value: 'var(--fontSize-xs)',
        variable: 'var(--text-1-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-4)',
        variable: 'var(--text-1-lineHeight)',
      },
    },
    2: {
      fontSize: {
        value: 'var(--fontSize-sm)',
        variable: 'var(--text-2-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-5)',
        variable: 'var(--text-2-lineHeight)',
      },
    },
    3: {
      fontSize: {
        value: 'var(--fontSize-base)',
        variable: 'var(--text-3-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-6)',
        variable: 'var(--text-3-lineHeight)',
      },
    },
    4: {
      fontSize: {
        value: 'var(--fontSize-lg)',
        variable: 'var(--text-4-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-7)',
        variable: 'var(--text-4-lineHeight)',
      },
    },
    5: {
      fontSize: {
        value: 'var(--fontSize-xl)',
        variable: 'var(--text-5-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-7)',
        variable: 'var(--text-5-lineHeight)',
      },
    },
    6: {
      fontSize: {
        value: 'var(--fontSize-2xl)',
        variable: 'var(--text-6-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-8)',
        variable: 'var(--text-6-lineHeight)',
      },
    },
    7: {
      fontSize: {
        value: 'var(--fontSize-3xl)',
        variable: 'var(--text-7-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-9)',
        variable: 'var(--text-7-lineHeight)',
      },
    },
    8: {
      fontSize: {
        value: 'var(--fontSize-4xl)',
        variable: 'var(--text-8-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-10)',
        variable: 'var(--text-8-lineHeight)',
      },
    },
    9: {
      fontSize: {
        value: 'var(--fontSize-5xl)',
        variable: 'var(--text-9-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-none)',
        variable: 'var(--text-9-lineHeight)',
      },
    },
    10: {
      fontSize: {
        value: 'var(--fontSize-6xl)',
        variable: 'var(--text-10-fontSize)',
      },
      lineHeight: {
        value: 'var(--lead-none)',
        variable: 'var(--text-10-lineHeight)',
      },
    },
  },
  ease: {
    linear: {
      value: 'cubic-bezier(0, 0, 1, 1)',
      variable: 'var(--ease-linear)',
    },
    default: {
      in: {
        value: 'cubic-bezier(0.4, 0, 1, 1)',
        variable: 'var(--ease-default-in)',
      },
      out: {
        value: 'cubic-bezier(0, 0, 0.2, 1)',
        variable: 'var(--ease-default-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.4, 0, 0.2, 1)',
        variable: 'var(--ease-default-inOut)',
      },
    },
    sine: {
      in: {
        value: 'cubic-bezier(0.12, 0, 0.39, 0)',
        variable: 'var(--ease-sine-in)',
      },
      out: {
        value: 'cubic-bezier(0.61, 1, 0.88, 1)',
        variable: 'var(--ease-sine-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.37, 0, 0.63, 1)',
        variable: 'var(--ease-sine-inOut)',
      },
    },
    quad: {
      in: {
        value: 'cubic-bezier(0.11, 0, 0.5, 0)',
        variable: 'var(--ease-quad-in)',
      },
      out: {
        value: 'cubic-bezier(0.5, 1, 0.89, 1)',
        variable: 'var(--ease-quad-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.45, 0, 0.55, 1)',
        variable: 'var(--ease-quad-inOut)',
      },
    },
    cubic: {
      in: {
        value: 'cubic-bezier(0.32, 0, 0.67, 0)',
        variable: 'var(--ease-cubic-in)',
      },
      out: {
        value: 'cubic-bezier(0.33, 1, 0.68, 1)',
        variable: 'var(--ease-cubic-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.65, 0, 0.35, 1)',
        variable: 'var(--ease-cubic-inOut)',
      },
    },
    quart: {
      in: {
        value: 'cubic-bezier(0.5, 0, 0.75, 0)',
        variable: 'var(--ease-quart-in)',
      },
      out: {
        value: 'cubic-bezier(0.25, 1, 0.5, 1)',
        variable: 'var(--ease-quart-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.76, 0, 0.24, 1)',
        variable: 'var(--ease-quart-inOut)',
      },
    },
    quint: {
      in: {
        value: 'cubic-bezier(0.64, 0, 0.78, 0)',
        variable: 'var(--ease-quint-in)',
      },
      out: {
        value: 'cubic-bezier(0.22, 1, 0.36, 1)',
        variable: 'var(--ease-quint-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.83, 0, 0.17, 1)',
        variable: 'var(--ease-quint-inOut)',
      },
    },
    expo: {
      in: {
        value: 'cubic-bezier(0.7, 0, 0.84, 0)',
        variable: 'var(--ease-expo-in)',
      },
      out: {
        value: 'cubic-bezier(0.16, 1, 0.3, 1)',
        variable: 'var(--ease-expo-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.87, 0, 0.13, 1)',
        variable: 'var(--ease-expo-inOut)',
      },
    },
    circ: {
      in: {
        value: 'cubic-bezier(0.55, 0, 1, 0.45)',
        variable: 'var(--ease-circ-in)',
      },
      out: {
        value: 'cubic-bezier(0, 0.55, 0.45, 1)',
        variable: 'var(--ease-circ-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.85, 0, 0.15, 1)',
        variable: 'var(--ease-circ-inOut)',
      },
    },
    back: {
      in: {
        value: 'cubic-bezier(0.36, 0, 0.66, -0.56)',
        variable: 'var(--ease-back-in)',
      },
      out: {
        value: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        variable: 'var(--ease-back-out)',
      },
      inOut: {
        value: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)',
        variable: 'var(--ease-back-inOut)',
      },
    },
  },
}

__module__.default = theme
__export__(__module__, 'theme', () => theme)
