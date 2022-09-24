import * as recast from 'recast'
import type { ASTNode } from 'ast-types'
import defu from 'defu'
import { castValues, resolveCustomDirectives, stringify } from '../utils'
import type { TokensFunction } from '../types'
import { resolveComputedProperties } from './vue/computed'

/**
 * Stringify every call of css() into a valid Vue <style> declaration.
 */
export const transformCssFunction = (
  id: string,
  code = '',
  variants: any | undefined,
  computedStyles: any | undefined,
  $tokens: TokensFunction,
) => {
  try {
    const declaration = resolveCssCallees(
      code,
      ast => transformCssDeclaration(ast, computedStyles),
    )

    const style = stringify(
      declaration,
      (property: any, value: any) => resolveCssProperty(property, value, variants, $tokens),
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
export function resolveCssProperty(property: any, value: any, variants: any, $tokens: TokensFunction) {
  // Resolve custom style directives
  const directive = resolveCustomDirectives(property, value, $tokens)
  if (directive) { return directive }

  // Push variants to variants

  // Transform variants to nested selectors
  if (property === 'variants') {
    variants = Object.assign(variants, defu(variants || {}, value))
    return castVariants(property, value)
  }

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
export function transformCssDeclaration(cssAst: ASTNode, computedStyles: any = {}) {
  resolveComputedProperties(cssAst, computedStyles)

  // eslint-disable-next-line no-eval
  const _eval = eval
  // const transformed = transform({ source: recast.print(ast).code })
  _eval(`var cssDeclaration = ${recast.print(cssAst).code}`)

  // @ts-expect-error - Evaluated code
  return cssDeclaration
}

