import type { File } from '@babel/types'
import { astTypes, findDefaultExport, printAst, visitAst } from '@pinceau/core/utils'
import type { NodePath } from 'ast-types/lib/node-path'
import type { namedTypes } from 'ast-types'
import type { ConfigLayer } from '../types'
import { resolveNodePath } from './config-definitions'

export function resolveConfigUtils(
  configAst: File,
  layer: ConfigLayer,
) {
  const utils: Record<string, { ts?: string; js?: string }> = {}

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
          utils[key] = {
            ts: printAst(path.value.value).code,
            js: layer?.utils?.[key]?.toString(),
          }
          return this.traverse(path)
        },
      },
    )
  }

  return utils
}
