import { astTypes, message, printAst } from '@pinceau/core/utils'
import { isSafeConstName } from './safe-const'

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
