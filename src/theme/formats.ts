import { objectPaths } from '../utils'

/**
 * Formats
 */

export const tsTypesDeclaration = (typesObject: any) => {
  let result = 'import type { DesignToken } from \'pinceau\'\n\n'

  result += `export interface GeneratedPinceauTheme ${JSON.stringify(typesObject, null, 2)}\n\n`

  // result += 'export interface GeneratedPinceauTheme extends DeepPartial<_GeneratedPinceauTheme> {}\n\n'

  const tokensPaths = objectPaths(typesObject)

  if (tokensPaths.length) { result += `export type GeneratedTokensPaths = \n${tokensPaths.map((path: string) => (`'${path}'`)).join(' | \n')}\n\n` }
  else { result += 'export type GeneratedTokensPaths = \'no.tokens\'\n\n' }

  // Cast object keys as types for result
  result = result.replace(/"DesignToken"/g, 'DesignToken')
  // result = result.replace(/\":/g, '\"?:')

  return result
}

export const tsFull = (tokensObject: any, aliased: any) => {
  let result = 'import { get } from \'pinceau/utils\'\n\n'

  result += 'import type { GeneratedPinceauTheme } from \'./index.d\'\n\n'

  result += `export const tokensAliases = ${JSON.stringify(aliased, null, 2)} as const\n\n`

  result += `export const themeTokens: GeneratedPinceauTheme = ${JSON.stringify(tokensObject, null, 2)}\n\n`

  return result
}

export const jsFull = (tokensObject: any, aliased: any) => {
  let result = `export const tokensAliases = ${JSON.stringify(aliased, null, 2)}\n\n`

  result += `export const themeTokens = ${JSON.stringify(tokensObject, null, 2)}\n\n`

  return result
}

