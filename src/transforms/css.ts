import type { ASTNode } from 'ast-types'
import { defu } from 'defu'
import { resolveCssProperty, stringify } from '../utils'
import type { TokensFunction } from '../types'
import { parseAst, printAst, visitAst } from '../utils/ast'
import { resolveComputedStyles } from './vue/computed'

/**
 * Stringify every call of css() into a valid Vue <style> declaration.
 */
export const transformCssFunction = (
  id: string,
  code = '',
  variants: any | undefined = {},
  computedStyles: any | undefined,
  $tokens: TokensFunction,
) => {
  try {
    const declaration = resolveCssCallees(
      code,
      ast => evalCssDeclaration(ast, computedStyles),
    )

    // Handle variants and remove them from declaration
    if (declaration?.variants) {
      Object.assign(variants, defu(variants || {}, declaration?.variants || {}))
      delete declaration.variants
    }

    const style = stringify(
      declaration,
      (property: any, value: any, _style: any, _selectors: any) => resolveCssProperty(property, value, _style, _selectors, $tokens),
    )

    if (style) { code = style }
  }
  catch (e) {
    return code
  }

  return code
}

/**
 * Transform a variants property to nested selectors.
 */
export function castVariants(property: any, value: any) {
  return Object.entries(value).reduce(
    (acc: any, [key, value]) => {
      acc[key] = value
      return acc
    },
    {},
  )
}

/**
 * Find all calls of css() and call a callback on each.
 */
export function resolveCssCallees(code: string, cb: (ast: ASTNode) => any): any {
  const ast = parseAst(code)
  let result = {}
  visitAst(ast, {
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
export function evalCssDeclaration(cssAst: ASTNode, computedStyles: any = {}) {
  // Resolve computed styled from AST of css() call
  resolveComputedStyles(cssAst, computedStyles)

  // eslint-disable-next-line no-eval
  const _eval = eval
  // const transformed = transform({ source: recast.print(ast).code })
  _eval(`var cssDeclaration = ${printAst(cssAst).code}`)

  // @ts-expect-error - Evaluated code
  return cssDeclaration
}

