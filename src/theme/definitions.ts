import type { namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import { defaultExport } from 'paneer'
import { parseAst, printAst, visitAst } from '../utils/ast'

/**
 * Resolve tokens and utils definitions (uri, range, content)
 */
export function resolveDefinitions(content: string, mediaQueriesKeys: string[], filePath: string) {
  const definitions = {}

  visitAst(
    defaultExport(parseAst(content) as any),
    {
      visitObjectProperty(path) {
        const tokenNode = getTokenNode(path, mediaQueriesKeys)

        if (tokenNode) {
          const key = resolvePropertyKeyPath(tokenNode)

          if (!key) { return false }

          if ((key.startsWith('utils.') || key.startsWith('media.')) && key.split('.').length > 2) { return false }

          definitions[key] = {
            uri: filePath,
            range: {
              start: path.value.loc.start,
              end: path.value.loc.end,
            },
          }

          if (key.startsWith('utils.')) { definitions[key].content = printAst(tokenNode.value.value).code }

          return false
        }

        if (tokenNode === false) { return false }

        return this.traverse(path)
      },
    },
  )

  return definitions
}

/**
 * Check if a node is a key inside a responsive
 */
function isResponsiveToken(node: any, mqKeys: string[]) {
  const properties = node?.value?.properties || []
  const propertiesKeys = properties.map(node => node?.key?.value?.toString() || node?.key?.name?.toString())
  if (propertiesKeys.includes('initial') && propertiesKeys.some(propKey => mqKeys.includes(propKey))) { return true }
}

/**
 * Check if a token is a full format
 */
function isTokenLike(node: NodePath<namedTypes.ObjectProperty>) {
  const properties = node?.value?.properties || []
  const propertiesKeys = properties.map(node => node?.key?.value?.toString() || node?.key?.name?.toString())
  if (propertiesKeys.includes('value')) { return true }
}

/**
 * Get a token node from a path
 */
function getTokenNode(node: NodePath<namedTypes.ObjectProperty>, mqKeys: string[]) {
  // Skip responsive tokens nested keys; return parent
  if (isResponsiveToken(node?.parent, mqKeys)) { return node?.parent }

  // Return parent when token is full format ({ value: ... })
  if (isTokenLike(node?.parent)) { return node?.parent }

  // Skip $schema
  if (node?.value?.key?.name === '$schema' || node?.parent?.value?.key?.name === '$schema') { return false }

  // Skip objects
  if (['FunctionDeclaration', 'ObjectExpression'].includes(node?.value?.value?.type)) { return }

  return node
}

/**
 * Walk back to root path of a node, resolving a token Node path.
 */
function resolvePropertyKeyPath(node: NodePath<namedTypes.ObjectProperty>) {
  let currentPath = node
  const currentKeyPath = []

  while (currentPath.parent) {
    const path = currentPath?.value?.key?.value?.toString() || currentPath?.value?.key?.name?.toString()
    if (path) { currentKeyPath.push(path) }
    currentPath = currentPath?.parent || undefined
  }

  return currentKeyPath.filter(Boolean).reverse().join('.')
}
