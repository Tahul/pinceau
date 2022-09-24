import * as recast from 'recast'
import type { ASTNode } from 'ast-types'
import defu from 'defu'
import { hash } from 'ohash'
import { castValues, resolveCustomDirectives, stringify } from '../utils'
import type { TokensFunction } from '../types'

/**
 * Stringify every call of css() into a valid Vue <style> declaration.
 */
export const transformCssFunction = (
  code = '',
  id: string,
  variants: any | undefined,
  computedStyles: any | undefined,
  $tokens: TokensFunction,
) => {
  try {
    const declaration = resolveCssCallees(
      code,
      ast => resolveComputedStyles(ast, computedStyles),
    )

    const style = stringify(
      declaration,
      (property: any, value: any) => resolveCssProperty(property, value, $tokens, variants),
    )

    if (style) { code = style }
  }
  catch (e) {
    return code
  }

  return code
}

/**
 * Resolve a css function property to a stringifiable declaration.
 */
export function resolveCssProperty(property: any, value: any, $tokens: TokensFunction, variants: any) {
  // Resolve custom style directives
  const directive = resolveCustomDirectives(property, value, $tokens)
  if (directive) { return directive }

  // Push variants to variants
  if (variants && value?.variants) { variants = defu(variants, value.variants) }

  // Transform variants to nested selectors
  if (property === 'variants') { return castVariants(property, value) }

  // Resolve final value
  value = castValues(property, value, $tokens)

  // Return proper declaration
  return {
    [property]: value,
  }
}

/**
 * Transform a variants property to nested selectors.
 */
export function castVariants(property: any, value: any) {
  return Object.entries(value).reduce(
    (acc: any, [key, value]) => {
      acc[`&.${key}`] = value
      return acc
    },
    {},
  )
}

/**
 * Find all calls of css() and call a callback on each.
 */
export function resolveCssCallees(code: string, cb: (ast: ASTNode) => any) {
  const ast = recast.parse(
    code,
    {
      parser: require('recast/parsers/typescript'),
    },
  )

  let result = {}
  recast.visit(ast, {
    visitCallExpression(path: any) {
      if (path.value.callee.name === 'css') {
        result = defu(result, cb(path.value.arguments[0]))
      }
      return this.traverse(path)
    },
  })

  return result
}

/**
 * Resolve computed styles found in css() declaration.
 */
export function resolveComputedStyles(cssAst: ASTNode, computedStyles: any) {
  if (!computedStyles) { return }

  // Search for function properties in css() AST
  recast.visit(
    cssAst,
    {
      visitObjectProperty(path) {
        if (path.value) {
          const valueType = path.value.value.type

          if (valueType === 'ArrowFunctionExpression' || valueType === 'FunctionExpression') {
            const id = `${hash(path.value.loc.start)}-${path.value.key.name}`

            // Push property function to computedStyles
            computedStyles[id] = recast.print(path.value.value.body).code

            path.replace(
              recast.types.builders.objectProperty(
                path.value.key,
                recast.types.builders.stringLiteral(`v-bind(_$cst['${id}'].value)`),
              ),
            )
          }
        }
        return this.traverse(path)
      },
    },
  )

  // eslint-disable-next-line no-eval
  const _eval = eval
  // const transformed = transform({ source: recast.print(ast).code })
  _eval(`var cssDeclaration = ${recast.print(cssAst).code}`)
  // @ts-expect-error - Evaluated code
  return cssDeclaration
}

