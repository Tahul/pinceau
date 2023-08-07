import type { Dictionary, Options } from 'style-dictionary-esm'
import StyleDictionary from 'style-dictionary-esm'
import type { Schema } from 'untyped'
import { objectPaths } from '@pinceau/core'
import { flattenTokens, walkTokens } from './tokens'
import type { ColorSchemeModes, PinceauMediaQueries } from './types'
import { enhanceTokenPaths, resolveThemeRule, stringifyUtils } from './helpers'

/**
 * import theme from '$pinceau/theme'
 * import type { GeneratedPinceauTheme, GeneratedPinceauPaths } from '$pinceau/theme'
 */
export function tsFull(tokensObject: any) {
  // Import config wrapper type
  let result = ''

  // Flatten tokens in full format too
  const flattenedTokens = flattenTokens(tokensObject)

  if (Object.keys(flattenedTokens).length) { result += `export const theme = ${JSON.stringify(flattenedTokens, null, 2)} as const\n\n` }
  else { result += 'export const theme = {}\n\n' }

  // Theme type
  result += 'export type GeneratedPinceauTheme = typeof theme\n\n'

  // Tokens paths type
  const tokensPaths = objectPaths(tokensObject)
  if (tokensPaths.length) { result += `export ${enhanceTokenPaths(tokensPaths)}\n\n` }
  else { result += 'export type GeneratedPinceauPaths = string\n\n' }

  // Default export
  result += 'export default theme'

  return result
}

/**
 * import 'pinceau.css'
 */
export function cssFull(dictionary: Dictionary, _options: Options, _responsiveTokens: any, colorSchemeMode: ColorSchemeModes) {
  const { formattedVariables } = StyleDictionary.formatHelpers

  // Create :root tokens list
  const tokens: any = {
    initial: [],
  }
  walkTokens(
    dictionary.tokens,
    (token) => {
      // Handle responsive tokens
      if (typeof token?.value === 'object' && token?.value?.initial) {
        Object.entries(token.value).forEach(([media, value]) => {
          if (!tokens[media]) { tokens[media] = [] }

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

  let css = ''

  // Create all responsive tokens rules
  Object.entries(tokens).forEach(
    (pair) => {
      const [key, value] = pair as [PinceauMediaQueries, string]

      // Resolve tokens content
      const formattedContent = formattedVariables({ format: 'css', dictionary: { ...dictionary, allTokens: value } as any, outputReferences: true, formatting: { lineSeparator: '', indentation: '', prefix: '' } as any })
      css += resolveThemeRule(key, formattedContent, tokens, colorSchemeMode)
    },
  )

  return css.replace(/(\n|\s\s)/g, '')
}

/**
 * definitions.ts
 */
export function definitionsFull(definitions: any) {
  return `export const definitions = ${JSON.stringify(definitions || {}, null, 2)} as const`
}

/**
 * Nuxt Studio schema support
 */
export function schemaFull(schema: Schema) {
  let result = `export const schema = ${JSON.stringify({ properties: schema?.properties?.tokensConfig || {}, default: (schema?.default as any)?.tokensConfig || {} }, null, 2)} as const\n\n`

  result += 'export const GeneratedPinceauThemeSchema = typeof schema\n\n'

  result += 'export default schema'

  return result
}

/**
 * import utils from '$pinceau/utils'
 */
export function utilsFull(
  utils = {},
  utilsImports: string[] = [],
  definitions = {},
) {
  // Add utilsImports from config
  let result = utilsImports.filter(Boolean).join('\n')

  // Stringify utils properties
  result += `${result === '' ? '' : '\n'}${stringifyUtils(utils, definitions)}`

  result += `export const utils = ${Object.keys(utils).length ? `{ ${Object.keys(utils).join(', ')} }` : '{}'}\n\n`

  // Type of utils
  result += 'export type GeneratedPinceauUtils = typeof utils\n\n'

  // Default export
  result += 'export default utils'

  return result
}

/**
 * HMR in development from '$pinceau/hmr'
 */
export function hmrFull(viteImportPath = '/@vite/client') {
  return `import { updateStyle } from \'${viteImportPath}\'\n

if (import.meta.hot) {
  import.meta.hot.on(
    \'pinceau:theme\',
    theme => {
      console.log({ theme })
      theme?.css && updateStyle(\'pinceau.css\', theme.css)
    }
  )
}`
}
