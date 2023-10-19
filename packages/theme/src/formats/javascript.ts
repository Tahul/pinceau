import { astTypes, printAst } from '@pinceau/core/utils'
import { tokensPaths } from '@pinceau/core/runtime'
import { flattenTokens } from '../utils/tokens'
import type { PinceauThemeFormat } from '../types'
import { resolveMediaQueriesKeys } from '../utils'

export const javascriptFormat: PinceauThemeFormat = {
  destination: 'theme.js',
  virtualPath: '/__pinceau_theme.js',
  importPath: '@pinceau/outputs/theme',
  formatter({ dictionary }) {
    const { tokens } = dictionary

    let result = ''

    // Flatten tokens in full format too
    const flattenedTokens = flattenTokens(tokens)

    if (Object.keys(flattenedTokens).length) { result += `export const theme = ${JSON.stringify(flattenedTokens, null, 2)}\n\n` }
    else { result += 'export const theme = {}\n\n' }

    // Default export
    result += 'export default theme'

    return result
  },
}

export const typescriptFormat: PinceauThemeFormat = {
  destination: 'theme.ts',
  virtualPath: '/__pinceau_theme_ts.ts',
  importPath: '@pinceau/outputs/theme-ts',
  formatter({ dictionary }) {
    const { tokens } = dictionary

    // Import config wrapper type
    let result = ''

    // Flatten tokens in full format too
    const flattenedTokens = flattenTokens(tokens)

    if (Object.keys(flattenedTokens).length) { result += `export const theme = ${JSON.stringify(flattenedTokens, null, 2)} as const\n\n` }
    else { result += 'export const theme = {} as const\n\n' }

    // Theme type
    result += 'export type PinceauTheme = typeof theme\n\n'

    // Media queries type
    const mqKeys = resolveMediaQueriesKeys(flattenedTokens)
    const mqId = 'PinceauMediaQueries'
    if (mqKeys.length) { result += `export ${arrayToUnionType(mqId, mqKeys)}\n\n` }
    else { result += `export type ${mqId} = \'$initial\' | \'$dark\' | \'$light\'\n\n` }

    // Tokens paths type
    const paths = tokensPaths(tokens, mqKeys).map(([keyPath]) => keyPath)
    const pathsId = 'PinceauThemePaths'
    if (tokensPaths.length) { result += `export ${arrayToUnionType(pathsId, paths)}\n\n` }
    else { result += `export type ${pathsId} = string\n\n` }

    // Default export
    result += 'export default theme'

    return result
  },
}

export const declarationFormat: PinceauThemeFormat = {
  destination: 'index.d.ts',
  virtualPath: '/__pinceau_types_d_ts.d.ts',
  importPath: '@pinceau/outputs',
  formatter({ ctx }) {
    const dedupe = (arr: string[]) => Array.from(new Set(arr))

    return [
      dedupe(ctx.types.imports).join('\n'),
      dedupe(ctx.types.raw).join('\n'),
      `declare global {
  ${dedupe(ctx.types.global).join('\n  ')}
}`,
      `export {
  ${dedupe(ctx.types.exports).join(',\n  ')}
}`,
    ].filter(Boolean).join('\n\n')
  },
}

/**
 * Enhance tokens paths list
 */
function arrayToUnionType(
  identifier: string,
  value: string[] = [],
) {
  const tokensLiteralNodes: any[] = []

  value.forEach(keyPath => tokensLiteralNodes.push(astTypes.builders.tsLiteralType(astTypes.builders.stringLiteral(`${keyPath.startsWith('$') ? keyPath : `$${keyPath}`}`))))

  const ast = astTypes.builders.tsTypeAliasDeclaration(
    astTypes.builders.identifier(identifier),
    astTypes.builders.tsUnionType(tokensLiteralNodes),
  )

  return printAst(ast).code
}
