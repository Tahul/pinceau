import { defineTheme } from 'pinceau'
import { PropertyValue } from '@pinceau/style'

export default defineTheme({
  media: {
    'xs': '(min-width: 475px)',
    'sm': '(min-width: 640px)',
    'md': '(min-width: 768px)',
    'lg': '(min-width: 1024px)',
  },

  color: {
    white: {
      value: '#ffffff'
    },
    black: '#0E0D0D',
    responsiveColor: {
      $initial: 'blue',
      $dark: 'red'
    },
    responsiveFullColor: {
      value: {
        $initial: 'green',
        $dark: 'yellow'
      }
    }
  },

  utils: {
    fixture: () => ({
      border: '1px solid blue'
    }),
    my: (value: PropertyValue<'margin'>) => {
      return {
        marginTop: value,
        marginBottom: value,
      }
    },
    mx: (value: PropertyValue<'margin'>) => {
      return {
        marginLeft: value,
        marginRight: value,
      }
    },
    py: (value: PropertyValue<'padding'>) => {
      return {
        paddingTop: value,
        paddingBottom: value,
      }
    },
    px: (value: PropertyValue<'padding'>) => {
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
    text: size => ({
      fontSize: `{text.${size}.fontSize}`,
      lineHeight: `{text.${size}.lineHeight}`,
    }),
    gradientText: (gradient: string) => ({
      '-webkit-text-fill-color': 'transparent',
      'backgroundImage': gradient,
      '-webkit-background-clip': 'text',
      'backgroundClip': 'text',
    }),
  },
})
