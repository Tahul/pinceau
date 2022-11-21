import { astTypes, expressionToAst, printAst, visitAst } from '../utils/ast'
import { flattenTokens, objectPaths } from '../utils'

const stringifyCustomProperties = (value: Record<string, any>) => {
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
 * Enhance stringified theme object
 */
const enhanceStringifedTheme = (value) => {
  const ast = expressionToAst(value, 'type GeneratedThemeType = ', 'ts')

  visitAst(
    ast,
    {
      visitTSPropertySignature(path) {
        if (path.value.typeAnnotation.typeAnnotation.literal?.type === 'StringLiteral') {
          path.insertBefore(
            astTypes.builders.commentBlock(
              `*\n * @default "${path.value.typeAnnotation.typeAnnotation.literal?.value}"\n`,
            ),
          )
          path.value.typeAnnotation.typeAnnotation = astTypes.builders.tsUnionType([
            astTypes.builders.tsLiteralType(astTypes.builders.stringLiteral(path.value.typeAnnotation.typeAnnotation.literal?.value)),
            astTypes.builders.tsTypeReference(
              astTypes.builders.identifier('ConfigToken'),
            ),
            astTypes.builders.tsTypeReference(
              astTypes.builders.identifier('PermissiveConfigType'),
            ),
          ])
        }
        else {
          path.value.typeAnnotation.typeAnnotation.members.push(
            astTypes.builders.tsIndexSignature(
              [astTypes.builders.identifier('key: string | number')],
              astTypes.builders.tsTypeAnnotation(
                astTypes.builders.tsUnionType([
                  astTypes.builders.tsTypeReference(
                    astTypes.builders.identifier('ConfigToken'),
                  ),
                  astTypes.builders.tsTypeReference(
                    astTypes.builders.identifier('PermissiveConfigType'),
                  ),
                ]),
              ),
            ),
          )
        }
        path.value.optional = true
        return this.traverse(path)
      },
    },
  )

  return printAst(ast).code
}

/**
 * Enhance tokens paths list
 */
const enhanceTokenPaths = (value = []) => {
  const tokensLiteralNodes = []

  value.forEach(([keyPath, value]) => {
    tokensLiteralNodes.push(
      astTypes.builders.tsPropertySignature(
        astTypes.builders.stringLiteral(keyPath),
        astTypes.builders.tsTypeAnnotation(
          astTypes.builders.tsLiteralType(
            astTypes.builders.stringLiteral(value),
          ),
        ),
      ),
    )
  })

  const ast = astTypes.builders.tsTypeAliasDeclaration(
    astTypes.builders.identifier('GeneratedTokensPaths'),
    astTypes.builders.tsTypeLiteral(tokensLiteralNodes),
  )

  /* Adds @type comment on top of every key
  visitAst(
    ast,
    {
      visitTSPropertySignature(path) {
        path.insertBefore(
          astTypes.builders.commentBlock(
            `*\n* @type {'${path.value.typeAnnotation.typeAnnotation.literal.value}'}\n`,
          ),
        )
        return this.traverse(path)
      },
    },
  )
  */

  return printAst(ast).code
}

/**
 * import type { PinceauTheme } from '#pinceau/types'
 */
export const tsTypesDeclaration = (tokensObject: any, customProperties = {}) => {
  let result = 'import { ConfigToken, PermissiveConfigType } from \'pinceau\'\n\n'

  let stringifiedTheme = JSON.stringify(tokensObject, null, 2)

  stringifiedTheme = enhanceStringifedTheme(stringifiedTheme)

  result += `export type GeneratedPinceauTheme = ${stringifiedTheme}\n\n`

  result += `const generatedCustomProperties = ${stringifyCustomProperties(customProperties)}\n`

  result += 'export type GeneratedCustomProperties = typeof generatedCustomProperties\n\n'

  const tokensPaths = objectPaths(tokensObject)

  if (tokensPaths.length) {
    result += `export ${enhanceTokenPaths(tokensPaths)}`
  }
  else {
    result += 'export type GeneratedTokensPaths = {}\n\n'
  }

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
