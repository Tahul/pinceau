import type { DesignToken } from 'style-dictionary-esm'
import StyleDictionary from 'style-dictionary-esm'
import type { PinceauMediaQueries, PinceauThemeFormat } from '../types'
import { walkTokens } from '../utils/tokens'
import { createThemeRule } from '../utils/css-rules'

export const cssFormat: PinceauThemeFormat = {
  importPath: 'pinceau.css',
  virtualPath: '/__pinceau_css.css',
  destination: 'theme.css',
  formatter({ ctx, dictionary }) {
    // Get context
    const colorSchemeMode = ctx.options.theme.colorSchemeMode
    const { formattedVariables } = StyleDictionary.formatHelpers

    // Create :root tokens list
    const tokens: { [key in PinceauMediaQueries]?: DesignToken[] } & { initial: DesignToken[] } = {
      initial: [],
    }

    walkTokens(
      dictionary.tokens,
      (token) => {
      // Handle responsive tokens
        if (typeof token?.value === 'object' && token?.value?.initial) {
          Object.entries(token.value).forEach(([media, value]) => {
            if (!tokens[media]) { tokens[media] = [] }

            // Recompose token
            tokens[media].push({
              ...token,
              attributes: {
                ...(token?.attributes || {}),
                media,
              },
              value,
            })
          })

          return token
        }

        // Handle regular tokens
        tokens.initial.push(token)

        return token
      },
    )

    // Init CSS result
    let css = ''

    // Create all responsive tokens rules
    Object.entries(tokens).forEach(
      ([key, value]) => {
      // Resolve tokens content
        const content = formattedVariables({
          format: 'css',
          dictionary: { ...dictionary, allTokens: value } as any,
          outputReferences: true,
          formatting: { lineSeparator: '', indentation: '', prefix: '' } as any,
        })

        css += createThemeRule({ mq: key as PinceauMediaQueries, content, theme: tokens, colorSchemeMode })
      },
    )

    return css.replace(/(\n|\s\s)/g, '')
  },
}
