import { parseAst, visitAst } from '@pinceau/core'
import type { namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'

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
