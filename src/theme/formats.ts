import { get, objectPaths } from '../utils'

export const tokensHelper = (ts = false) => {
  return `const defaultTokensHelperOptions${ts ? ': TokensHelperOptions' : ''} = {
  key: 'variable',
  flatten: true,
  silent: false
}

/**
 * Get a theme token by its path
 */
export const $tokens = (path${ts ? ': DesignTokensPaths' : ''} = undefined, options${ts ? ': TokensHelperOptions' : ''} = {}) => {
  const { key, flatten } = Object.assign(defaultTokensHelperOptions, options)

  if (!path) return themeTokens

  if (key === 'variable' && tokensAliases[path]) {
    return tokensAliases[path]
  }

  const token = get(themeTokens, path)

  if (key && token?.[key]) { return token[key] }

  if (key && flatten && typeof token === 'object') {
    const flattened = {}
    
    const flattenTokens = (obj) => {
      Object.entries(obj).forEach(([objectKey, value]) => {
        if (value[key]) {
          flattened[objectKey] = value[key]
          return
        }

        flattenTokens(value)
      })
    }

    flattenTokens(token)

    return flattened
  }

  return token
}\n\n`
}

export const getFunction = `const get = ${get.toString()}`

/**
 * Formats
 */

export const tsTypesDeclaration = (typesObject: any) => {
  let result = 'import { DesignToken, PinceauConfig } from \'pinceau\'\n\n'

  result += `export interface GeneratedPinceauTheme extends PinceauConfig ${JSON.stringify(typesObject, null, 2)}\n\n`

  const tokensPaths = objectPaths(typesObject)

  if (tokensPaths.length)
    result += `export type DesignTokensPaths = \n${tokensPaths.map((path: string) => (`'${path}'`)).join(' | \n')}\n\n`
  else
    result += 'export type DesignTokensPaths = \'no.tokens\'\n\n'

  // Cast object keys as types for result
  result = result.replace(/"DesignToken"/g, 'DesignToken')

  return result
}

export const tsFull = (tokensObject: any, aliased: any) => {
  let result = 'import { get } from \'pinceau\''

  result += 'import type { GeneratedPinceauTheme } from \'./pinceau.d.ts\'\n\n'

  result += `export const aliases = ${JSON.stringify(aliased, null, 2)} as const\n\n`

  result += `export const theme: GeneratedPinceauTheme = ${JSON.stringify(tokensObject, null, 2)}\n\n`

  result += tokensHelper(true)

  result += 'export const $dt = $tokens\n\n'

  return result
}

export const jsFull = (tokensObject: any, aliased: any) => {
  let result = `${getFunction}\n\n`

  result += `export const tokensAliases = ${JSON.stringify(aliased, null, 2)}\n\n`

  result += `export const themeTokens = ${JSON.stringify(tokensObject, null, 2)}\n\n`

  result += tokensHelper(false)

  result += 'export const $dt = $tokens\n\n'

  return result
}

