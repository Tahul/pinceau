import type { ASTNode } from 'ast-types'
import { printAst } from './ast'

/**
 * Resolve computed styles found in css() declaration.
 */
export function evalDeclaration(cssAst: ASTNode) {
  try {
    // eslint-disable-next-line no-eval
    const _eval = eval

    _eval(`var $__declaration = ${printAst(cssAst).code}`)

    // @ts-expect-error - Evaluated code
    return $__declaration
  }
  catch (e) {
    console.log({ e })
    return {}
  }
}
