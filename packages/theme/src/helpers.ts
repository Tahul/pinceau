import { astTypes, message, printAst } from '@pinceau/core'
import { isSafeConstName } from './safe-const'
import type { ColorSchemeModes, PinceauMediaQueries } from './types'

/**
 * Stringify utils from object
 */
export function stringifyUtils(value: Record<string, any>, definitions: any) {
  const entries = Object.entries(value)

  return entries.reduce(
    (acc, [key, value]) => {
      // Check if util has valid key
      if (!isSafeConstName(key)) {
        message('UTIL_NAME_CONFLICT', [key])
        return acc
      }

      // If definitions enabled, use typed version
      if (definitions[`utils.${key}`]?.content) {
        acc += `export const ${key} = ${definitions[`utils.${key}`].content}\n\n`
        return acc
      }

      // Stringify from utils values instead
      if (typeof value === 'function') { acc += `export const ${key} = ${String(value)}\n\n` }
      else { acc += `export const ${key} = ${JSON.stringify(value, null, 4)}\n\n` }
      return acc
    },
    '',
  )
}

/**
 * Return a theme rule from a media query key, some content and a theme.
 */
export function resolveThemeRule(
  mq: PinceauMediaQueries,
  content?: string,
  theme?: any,
  colorSchemeMode?: ColorSchemeModes,
) {
  let responsiveSelector = ''
  if (mq === 'dark' || mq === 'light') {
    if (colorSchemeMode === 'class') { responsiveSelector = `:root.${mq}` }
    else { responsiveSelector = `(prefers-color-scheme: ${mq})` }
  }
  else if (mq !== 'initial' && theme) {
    const queryToken = theme?.media?.[mq]
    if (queryToken) { responsiveSelector = queryToken.value }
  }
  let prefix
  if (!responsiveSelector) { prefix = '@media { :root {' }
  else if (responsiveSelector.startsWith('.')) { prefix = `@media { :root${responsiveSelector} {` }
  else if (responsiveSelector.startsWith(':root')) { prefix = `@media { ${responsiveSelector} {` }
  else { prefix = `@media ${responsiveSelector} { :root {` }
  return `${`${`${prefix}--pinceau-mq: ${String(mq)}; ${content}`} } }`}\n`
}

/**
 * Enhance tokens paths list
 */
export function enhanceTokenPaths(value = []) {
  const tokensLiteralNodes: any[] = []

  value.forEach(([keyPath]: [string]) => tokensLiteralNodes.push(astTypes.builders.tsLiteralType(astTypes.builders.stringLiteral(keyPath))))

  const ast = astTypes.builders.tsTypeAliasDeclaration(
    astTypes.builders.identifier('GeneratedPinceauPaths'),
    astTypes.builders.tsUnionType(tokensLiteralNodes),
  )

  return printAst(ast).code
}
