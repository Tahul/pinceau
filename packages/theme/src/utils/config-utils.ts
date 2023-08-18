import type { File } from '@babel/types'
import { findDefaultExport, printAst, visitAst } from '@pinceau/core/utils'
import type { NodePath } from 'ast-types/lib/node-path'
import type { namedTypes } from 'ast-types'
import { resolveNodePath } from './config-definitions'

export function resolveConfigUtils(configAst: File) {
  const utils: Record<string, string> = {}

  let utilsNode: NodePath<namedTypes.ObjectProperty> | undefined

  // Find `utils` key
  visitAst(
    findDefaultExport(configAst),
    {
      visitObjectProperty(path) {
        if (path.value.key.name !== 'utils') { return this.traverse(path) }
        utilsNode = path
        return false
      },
    },
  )

  // Resolve `utils` node content
  if (utilsNode) {
    visitAst(
      utilsNode.value,
      {
        visitObjectProperty(path) {
          const key = resolveNodePath(path)
          if (!key) { return this.traverse(path) }
          if (key.split('.').length > 1) { return false }
          utils[key] = printAst(path.value.value).code
          return this.traverse(path)
        },
      },
    )
  }

  return utils
}
