import { printAst } from '@pinceau/core/utils'
import type { ASTNode } from 'ast-types'

/**
 * Resolve computed styles found in css() declaration.
 */
export function evalCSSDeclaration(cssAst: ASTNode) {
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
