import { objectPaths } from '../utils'

export const tsTypesDeclaration = (typesObject: any) => {
  let result = 'import type { DesignToken } from \'pinceau\'\n\n'

  result += `export interface GeneratedPinceauTheme ${JSON.stringify(typesObject, null, 2)}\n\n`

  const tokensPaths = objectPaths(typesObject)

  if (tokensPaths.length) { result += `export type GeneratedTokensPaths = \n${tokensPaths.map((path: string) => (`'${path}'`)).join(' | \n')}\n\n` }
  else { result += 'export type GeneratedTokensPaths = \'no.tokens\'\n\n' }

  // Cast object keys as types for result
  result = result.replace(/"DesignToken"/g, 'DesignToken')

  return result
}

export const tsFull = (tokensObject: any, aliased: any) => {
  let result = 'import type { GeneratedPinceauTheme } from \'./types\'\n\n'

  result += `export const aliases = ${JSON.stringify(aliased, null, 2)} as const\n\n`

  result += `export const theme: GeneratedPinceauTheme = ${JSON.stringify(tokensObject, null, 2)} as const\n\n`

  return result
}

export const jsFull = (tokensObject: any, aliased: any) => {
  let result = `export const aliases = ${JSON.stringify(aliased, null, 2)}\n\n`

  result += `export const theme = ${JSON.stringify(tokensObject, null, 2)}\n\n`

  return result
}

