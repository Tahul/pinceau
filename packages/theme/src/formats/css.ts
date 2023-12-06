import SD from 'style-dictionary'
import type { PinceauMediaQueries } from '@pinceau/outputs'
import type { DesignToken } from '../types'
import type { PinceauThemeFormat } from '../types/options'
import { walkTokens } from '../utils/tokens'
import { createThemeRule } from '../utils/css-rules'

export const cssFormat: PinceauThemeFormat = {
  importPath: '@pinceau/outputs/theme.css',
  virtualPath: '/__pinceau_theme_css.css',
  destination: 'theme.css',
  formatter({ ctx, dictionary }) {
    // Get context
    const colorSchemeMode = ctx.options.theme.colorSchemeMode
    const { formattedVariables } = SD.formatHelpers

    // Create :root tokens list
    const mediaQueries: { [key in PinceauMediaQueries]?: DesignToken[] } & { $initial: DesignToken[] } = {
      $initial: [],
    }

    walkTokens(
      dictionary.tokens,
      (token) => {
        // Handle responsive tokens
        if (typeof token?.value === 'object' && token?.value?.$initial) {
          Object.entries(token.value).forEach(([query, value]) => {
            if (!mediaQueries[query]) { mediaQueries[query] = [] }

            // Set `media` scope for property formatter
            if (!token.attributes) { token.attributes = {} }
            token.attributes.media = query

            // Recompose token
            mediaQueries[query].push({
              ...token,
              value,
            })
          })

          return token
        }

        // Handle regular tokens
        mediaQueries.$initial.push(token)

        return token
      },
    )

    // Init CSS result
    let css = ''

    // Create all responsive tokens rules
    Object.entries(mediaQueries).forEach(
      ([key, value]) => {
      // Resolve tokens content
        const content = formattedVariables({
          format: 'css',
          dictionary: { ...dictionary, allTokens: value } as any,
          outputReferences: true,
          formatting: ctx.options.dev
            ? { separator: ':', indentation: '    ', prefix: '--', commentStyle: 'long', suffix: ';\n' }
            : { separator: ':', indentation: '    ', prefix: '--', commentStyle: 'long', suffix: ';' },
        })

        css += createThemeRule({ mq: key as PinceauMediaQueries, content, theme: dictionary.tokens, colorSchemeMode })
      },
    )

    return ctx.options.dev ? css : css.replace(/(\n|\s\s)/g, '')
  },
}
