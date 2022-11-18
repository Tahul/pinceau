import { flattenTokens, objectPaths } from '../utils'

const stringifyCustomProperties = (value: { [key: string]: any }) => {
  const entries = Object.entries(value)
  let result = entries.reduce(
    (acc, [key, value]) => {
      if (typeof value === 'function') { acc += `"${key}": ${String(value)},\n` }
      else { acc += `"${key}": ${JSON.stringify(value, null, 2)},\n` }
      return acc
    },
    '{\n',
  )
  result += '\n}\n'
  return result
}

/**
 * import type { PinceauTheme } from '#pinceau/types'
 */
export const tsTypesDeclaration = (tokensObject: any, customProperties = {}) => {
  let result = 'import type { DesignToken } from \'pinceau\'\n\n'

  result += 'type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]>; } : T;\n\n'

  result += `export type GeneratedPinceauTheme = DeepPartial<${JSON.stringify(tokensObject, null, 2)}>\n\n`

  result += `const generatedCustomProperties = ${stringifyCustomProperties(customProperties)}\n`

  result += 'export type GeneratedCustomProperties = typeof generatedCustomProperties\n\n'

  const tokensPaths = objectPaths(tokensObject)

  if (tokensPaths.length) {
    result += `export type GeneratedTokensPaths = ${tokensPaths.map((path: string) => (`'${path}'`)).join(' | \n')}\n\n`
  }
  else {
    result += 'export type GeneratedTokensPaths = \'no.tokens\'\n\n'
  }

  // Cast object keys as types for result
  result = result.replace(/"DesignToken"/g, 'DesignToken')

  return result
}

/**
 * import theme from '#pinceau/theme'
 */
export const tsFull = (tokensObject: any, customProperties = {}) => {
  let result = 'import type { GeneratedPinceauTheme, GeneratedCustomProperties } from \'./types\'\n\n'

  result += `export const theme: GeneratedPinceauTheme = ${JSON.stringify(tokensObject, null, 2)} as const\n\n`

  result += `export const customProperties: GeneratedCustomProperties = ${stringifyCustomProperties(customProperties)}`

  result += 'export default { theme, customProperties }'

  return result
}

/**
 * import theme from '#pinceau/theme/flat'
 */
export const tsFlat = (tokensObject: any, customProperties = {}) => {
  let result = `export const theme = ${JSON.stringify(flattenTokens(tokensObject), null, 2)}\n\n`

  result += `export const customProperties = ${stringifyCustomProperties(customProperties)}`

  result += 'export default { theme, customProperties }'

  return result
}

/**
 * import theme from '#pinceau/theme'
 *
 * In JS contexts.
 */
export const jsFull = (tokensObject: any, customProperties = {}) => {
  let result = `export const theme = ${JSON.stringify(tokensObject, null, 2)}\n\n`

  result += `export const customProperties = ${stringifyCustomProperties(customProperties)}`

  result += 'export default { theme, customProperties }'

  return result
}

/**
 * import theme from '#pinceau/theme/flat'
 *
 * In JS contexts.
 */
export const jsFlat = (tokensObject: any, customProperties = {}) => {
  let result = `export const theme = ${JSON.stringify(flattenTokens(tokensObject), null, 2)}\n\n`

  result += `export const customProperties = ${stringifyCustomProperties(customProperties)}`

  result += 'export default { theme, customProperties }'

  return result
}
