import type { Dictionary, Options } from 'style-dictionary-esm'
import StyleDictionary from 'style-dictionary-esm'
import { resolveSchema as resolveUntypedSchema } from 'untyped'
import type { ColorSchemeModes } from '../types'
import { walkTokens } from '../utils/data'
import { astTypes, printAst } from '../utils/ast'
import { flattenTokens, objectPaths } from '../utils'
import { responsiveMediaQueryRegex } from '../utils/regexes'

/**
 * Stringify utils from object
 */
const stringifyUtils = (value: Record<string, any>) => {
  const entries = Object.entries(value)
  let result = entries.reduce(
    (acc, [key, value]) => {
      if (typeof value === 'function') { acc += `  "${key}": ${String(value)},\n` }
      else { acc += `  "${key}": ${JSON.stringify(value, null, 4)},\n` }
      return acc
    },
    '{\n',
  )
  result += '}'
  return result
}

/**
 * Enhance tokens paths list
 */
const enhanceTokenPaths = (value = []) => {
  const tokensLiteralNodes = []

  value.forEach(([keyPath]) => {
    tokensLiteralNodes.push(
      astTypes.builders.tsLiteralType(astTypes.builders.stringLiteral(keyPath)),
    )
  })

  const ast = astTypes.builders.tsTypeAliasDeclaration(
    astTypes.builders.identifier('GeneratedPinceauPaths'),
    astTypes.builders.tsUnionType(tokensLiteralNodes),
  )

  return printAst(ast).code
}

/**
 * import theme from '#pinceau/theme'
 * import type { GeneratedPinceauTheme, GeneratedPinceauPaths } from '#pinceau/theme'
 */
export function tsFull(tokensObject: any) {
  // Import config wrapper type
  let result = 'import type { PermissiveConfigType } from \'pinceau\'\n\n'

  // Flatten tokens in full format too
  const flattenedTokens = flattenTokens(tokensObject)

  // Theme object
  result += `export const theme = ${JSON.stringify(flattenedTokens, null, 2)} as const\n\n`

  // Theme type
  result += 'export type GeneratedPinceauTheme = PermissiveConfigType<typeof theme>\n\n'

  // Tokens paths type
  const tokensPaths = objectPaths(tokensObject)
  if (tokensPaths.length) { result += `export ${enhanceTokenPaths(tokensPaths)}\n\n` }
  else { result += 'export type GeneratedPinceauPaths = \'\'\n\n' }

  // Default export
  result += 'export default theme'

  return result
}

/**
 * Nuxt Studio schema support
 */
export async function schemaFull(tokensObject) {
  const schema = await resolveUntypedSchema({ tokensConfig: tokensObject })

  let result = `export const schema = ${JSON.stringify({ properties: (schema.properties as any).tokensConfig, default: (schema.default as any).tokensConfig }, null, 2)} as const\n\n`

  result += 'export const GeneratedPinceauThemeSchema = typeof schema\n\n'

  return result
}

/**
 * import utils from '#pinceau/utils'
 */
export const utilsFull = (utils = {}) => {
  // Stringify utils properties
  let result = `export const utils = ${stringifyUtils(utils)} as const\n\n`

  // Type of utils
  result += 'export type GeneratedPinceauUtils = typeof utils\n\n'

  // Default export
  result += 'export default utils'

  return result
}

/**
 * import 'pinceau.css'
 */
export const cssFull = (dictionary: Dictionary, options: Options, responsiveTokens: any, colorSchemeMode: ColorSchemeModes) => {
  // Resolve regular theme declaration
  const selector = options.selector ? options.selector : ':root'
  const { outputReferences } = options
  const { formattedVariables } = StyleDictionary.formatHelpers

  // Create :root tokens list
  const initialTokens = []
  walkTokens(
    dictionary.tokens,
    (value) => {
      initialTokens.push({
        ...value,
        value: value?.value?.initial || value?.value,
      })
      return value
    },
  )
  let css = `@media {\n ${selector} {\n  --pinceau-mq: initial;\n${formattedVariables({ format: 'css', dictionary: { allTokens: initialTokens } as any, outputReferences })}\n}\n}\n`

  // Create all responsive tokens rules
  Object.entries(responsiveTokens).forEach(
    ([key, value]) => {
      // Resolve tokens content
      const formattedResponsiveContent = formattedVariables({ format: 'css', dictionary: { allTokens: value } as any, outputReferences })

      // Resolve responsive selector
      let responsiveSelector
      if (key === 'dark' || key === 'light') {
        // Handle dark/light modes
        if (colorSchemeMode === 'class') { responsiveSelector = `:root.${key}` }
        else { responsiveSelector = `@media (prefers-color-scheme: ${key})` }
      }
      else {
        responsiveSelector = dictionary.allTokens.find(token => token.name === `media-${key}`)?.value
      }

      // Write responsive tokens
      if (responsiveSelector.match(responsiveMediaQueryRegex)) {
        // Use raw selector
        css += `@media {\n ${responsiveSelector} {\n  --pinceau-mq: ${key};\n${formattedResponsiveContent}\n}\n}\n`
      }
      else {
        // Wrap :root with media query
        css += `\n@media ${responsiveSelector} { :root {\n  --pinceau-mq: ${key};\n${formattedResponsiveContent}\n}\n}\n`
      }
    },
  )

  return css
}
