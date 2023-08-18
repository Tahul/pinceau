import { camelCase, kebabCase } from 'scule'
import type { PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { astTypes, printAst, visitAst } from '@pinceau/core/utils'
import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import { createSourceLocationFromOffsets } from 'sfc-composer'
import { resolveCssProperty, stringify } from '@pinceau/stringify'
import type { PinceauCSSFunctionContext } from '../types/css-function'
import { evalCSSDeclaration } from './eval'

/**
 * Resolve transform context runtime features from `css()` function.
 *
 * Useful for frameworks runtime engine integrations.
 */
export const resolveCSSFunctionContext: PinceauTransformFunction<PinceauCSSFunctionContext> = (
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
  ast: NodePath<namedTypes.CallExpression, any>,
  index: number = 0,
): PinceauCSSFunctionContext => {
  // Grab `*` in `css(*)`
  const argument = ast.value.arguments[0] as NodePath<namedTypes.ObjectExpression>

  const localTokens: PinceauCSSFunctionContext['localTokens'] = {}
  const variants: PinceauCSSFunctionContext['variants'] = {}
  const computedStyles: PinceauCSSFunctionContext['computedStyles'] = []

  // Create context
  const loc = createSourceLocationFromOffsets(transformContext.target.toString(), ast.value.start, ast.value.end)

  // Search for function properties in css() AST
  visitAst(
    argument as any as ASTNode,
    {
      visitObjectProperty(path) {
        if (path.value) {
          // Resolve path key & type
          const key = path?.value?.key?.name || path?.value?.key?.value
          const valueType = path?.value?.value?.type

          // Store local tokens
          if (key.startsWith('--') && transformContext.state.localTokens) {
            localTokens[key] = path.value.value
          }

          // Store computed styles in state
          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            const computedStyleKey = camelCase((key).replace(/--/g, '__'))
            const id = `$cs${index}_${computedStyleKey}`
            const variable = `--${kebabCase(id)}`

            // Push property function to computedStyles
            computedStyles.push({
              id,
              variable,
              source: path.value.value.body,
              compiled: printAst(path.value.value).code,
            })

            // Overwrite function in declaration by the CSS variable.
            path.replace(
              astTypes.builders.objectProperty(
                path.value.key,
                astTypes.builders.stringLiteral(`var(--${variable})`),
              ),
            )
          }
        }

        return this.traverse(path)
      },
    },
  )

  // Handle variants and remove them from declaration
  const declaration = evalCSSDeclaration(argument as any)
  if (declaration && declaration?.variants) {
    Object.assign(variants, { ...declaration.variants })
    delete declaration.variants
  }

  // Transform css() declaration to string
  const css = stringify(
    declaration,
    stringifyContext => resolveCssProperty(
      stringifyContext,
      pinceauContext,
    ),
  )

  return {
    ast: argument,
    loc,
    css,
    declaration,
    variants,
    computedStyles,
    localTokens,
  }
}
