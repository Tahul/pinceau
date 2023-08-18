import { astTypes, printAst } from '@pinceau/core/utils'
import { tokensPaths } from '@pinceau/core/runtime'
import { flattenTokens } from '../utils/tokens'
import type { PinceauThemeFormat } from '../types'
import { resolveMediaQueriesKeys } from '../utils'

/**
 * Enhance tokens paths list
 */
function arrayToUnionType(
  identifier: string,
  value: string[] = []
) {
  const tokensLiteralNodes: any[] = []

  value.forEach((keyPath) => tokensLiteralNodes.push(astTypes.builders.tsLiteralType(astTypes.builders.stringLiteral(keyPath))))

  const ast = astTypes.builders.tsTypeAliasDeclaration(
    astTypes.builders.identifier(identifier),
    astTypes.builders.tsUnionType(tokensLiteralNodes),
  )

  return printAst(ast).code
}

export const typescriptFormat: PinceauThemeFormat = {
  destination: 'theme.ts',
  virtualPath: '/__pinceau_ts.ts',
  importPath: '$pinceau/theme',
  formatter({ dictionary }) {
    const { tokens } = dictionary

    // Import config wrapper type
    let result = ''

    // Flatten tokens in full format too
    const flattenedTokens = flattenTokens(tokens)

    if (Object.keys(flattenedTokens).length) { result += `export const theme = ${JSON.stringify(flattenedTokens, null, 2)} as const\n\n` }
    else { result += 'export const theme = {} as const\n\n' }

    // Theme type
    result += 'export type GeneratedPinceauTheme = typeof theme\n\n'

    // Media queries type
    const mqKeys = resolveMediaQueriesKeys(flattenedTokens)
    const mqId = `GeneratedPinceauMediaQueries`
    if (mqKeys.length) { result += `export ${arrayToUnionType(mqId, mqKeys)}\n\n` }
    else { result += 'export type GeneratedPinceauMediaQueries = \'initial\' | \'dark\' | \'light\'\n\n' }

    // Tokens paths type
    const paths = tokensPaths(tokens).map(([keyPath]) => keyPath)
    const pathsId = `GeneratedPinceauPaths`
    if (tokensPaths.length) { result += `export ${arrayToUnionType(pathsId, paths)}\n\n` }
    else { result += `export type GeneratedPinceauPaths = string\n\n`}

    // Default export
    result += 'export default theme'

    return result
  },
}
