import { parseAst, visitAst } from '@pinceau/core/utils'
import type { namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'

/**
 * Find all calls of css() and call a callback on each.
 */
export function resolveCSSCallees(code: string) {
  const ast = parseAst(code)

  const paths: NodePath<namedTypes.CallExpression>[] = []

  visitAst(ast, {
    visitCallExpression(path) {
      if (path.value.callee.name === 'css') { paths.push(path) }
      return this.traverse(path)
    },
  })

  return paths
}
