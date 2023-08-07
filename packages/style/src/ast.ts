import { parseAst, visitAst } from '@pinceau/core'
import type { namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'

/**
 * Find all calls of css() and call a callback on each.
 */
export function resolveCSSCallees(code: string, cb: (ast: NodePath<namedTypes.CallExpression, any>, index: number) => void): any {
  const ast = parseAst(code)

  let count = 0

  visitAst(ast, {
    visitCallExpression(path) {
      if (path.value.callee.name === 'css') { cb(path, count) }
      count++
      return this.traverse(path)
    },
  })
}
