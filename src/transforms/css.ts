import type { ASTNode, namedTypes } from 'ast-types'
import { defu } from 'defu'
import { parse } from 'acorn'
import type { NodePath } from 'ast-types/lib/node-path'
import type { SFCStyleBlock } from 'vue/compiler-sfc'
import type { PinceauTransformContext } from '../types/transforms'
import type { PinceauContext } from '../types'
import { resolveCssProperty, stringify } from '../utils'
import { parseAst, printAst, visitAst } from '../utils/ast'
import { resolveRuntimeContents } from './vue/computed'

/**
 * Stringify every call of css() into a valid Vue <style> declaration.
 */
export const transformCssFunction = (
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
  styleBlock?: SFCStyleBlock,
) => {
  const code = styleBlock?.content || transformContext.code

  // Enhance error logging for `css()`
  try {
    parse(code, { ecmaVersion: 'latest' })
  }
  catch (e) {
    // if (!e.loc) { e.loc = {} }
    // e.loc.line = (transformContext.loc.start.line + e.loc.line) - 1
    // const filePath = `${transformContext.query.id.split('?')[0]}:${e.loc.line}:${e.loc.column}`
    // message('TRANSFORM_ERROR', [filePath, e])
    console.log({ e, code, query: transformContext.query })
    return ''
  }

  let cssContent = ''

  // Resolve stringifiable declaration from `css()` content
  resolveCssCallees(
    code,
    (ast) => {
      const value = ast.value.arguments[0]

      // Resolve computed styled from AST of css() call
      resolveRuntimeContents(value, transformContext)

      // Get declaration object
      const declaration = evalCssDeclaration(value)

      // Remove variants from declaration and drop the key
      if (declaration && declaration?.variants) {
        Object.assign(
          transformContext.variants || {},
          defu(transformContext.variants || {}, declaration?.variants || {}),
        )
        delete declaration.variants
      }

      cssContent += stringify(
        declaration,
        stringifyContext => resolveCssProperty(
          stringifyContext,
          transformContext,
          pinceauContext,
        ),
      )
    },
  )

  if (code && styleBlock) {
    transformContext.magicString.remove(styleBlock.loc.start.offset, styleBlock.loc.end.offset)
    transformContext.magicString.appendRight(styleBlock.loc.start.offset, cssContent)
  }
  else {
    transformContext.magicString.remove(0, transformContext.loc.source.length)
    transformContext.magicString.appendRight(0, cssContent)
  }
}

/**
 * Find all calls of css() and call a callback on each.
 */
export function resolveCssCallees(code: string, cb: (ast: NodePath<namedTypes.CallExpression, any>) => void): any {
  const ast = parseAst(code)
  visitAst(ast, {
    visitCallExpression(path) {
      if (path.value.callee.name === 'css') { cb(path) }
      return this.traverse(path)
    },
  })
}

/**
 * Resolve computed styles found in css() declaration.
 */
export function evalCssDeclaration(cssAst: ASTNode) {
  try {
    // eslint-disable-next-line no-eval
    const _eval = eval

    // const transformed = transform({ source: recast.print(ast).code })
    _eval(`var cssDeclaration = ${printAst(cssAst).code}`)

    // @ts-expect-error - Evaluated code
    return cssDeclaration
  }
  catch (e) {
    return {}
  }
}
