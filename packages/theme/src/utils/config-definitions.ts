import type { namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import type { File } from '@babel/types'
import { findDefaultExport, visitAst } from '@pinceau/core/utils'
import type { PinceauThemeDefinitions } from '../types/definitions'

/**
 * Resolve tokens and utils definitions (uri, range, content)
 */
export function resolveConfigDefinitions(
  ast: File,
  mqKeys: string[],
  filePath?: string,
) {
  const definitions: PinceauThemeDefinitions = {}

  visitAst(
    findDefaultExport(ast),
    {
      visitObjectProperty(path) {
        // Skip $schema
        if (path?.value?.key?.name === '$schema' || path?.parent?.value?.key?.name === '$schema') { return false }

        const tokenNode = isTokenNode(path, mqKeys)

        if (tokenNode) {
          const key = resolveNodePath(tokenNode)

          if (!key) { return false }

          if ((key.startsWith('utils.') || key.startsWith('media.')) && key.split('.').length > 2) { return false }

          definitions[key] = {
            uri: filePath || '/',
            range: {
              start: path.value.loc.start,
              end: path.value.loc.end,
            },
          }

          return false
        }

        return this.traverse(path)
      },
    },
  )

  return definitions
}

/**
 * Check if a node is a key inside a responsive
 */
export function isResponsiveToken(node: NodePath<namedTypes.ObjectProperty>, mqKeys: string[]) {
  const properties = node?.value?.value?.properties || []
  const propertiesKeys = properties.map(node => node?.key?.value?.toString() || node?.key?.name?.toString())
  if (propertiesKeys.includes('$initial') && propertiesKeys.some(propKey => mqKeys.includes(propKey))) { return true }
}

/**
 * Check if a token is a full format
 */
export function isDesignTokenLike(node: NodePath<namedTypes.ObjectProperty>) {
  const properties = node?.value?.value?.properties || []
  const propertiesKeys = properties.map(node => node?.key?.value?.toString() || node?.key?.name?.toString())
  if (propertiesKeys.includes('value')) { return true }
}

/**
 * Get a token node from a path
 */
export function isTokenNode(node: NodePath<namedTypes.ObjectProperty>, mqKeys: string[]) {
  // Return current node if value is token like (string, number)
  if (['ArrayExpression', 'StringLiteral', 'NumericLiteral'].includes(node.value?.value?.type)) { return node }

  // Skip responsive tokens nested keys; return parent
  if (isResponsiveToken(node, mqKeys)) { return node }

  // Return parent when token is full format ({ value: ... })
  if (isDesignTokenLike(node)) { return node }

  // Skip objects
  if (['FunctionDeclaration', 'ObjectExpression'].includes(node?.value?.value?.type)) { return }

  return node
}

/**
 * Walk back to root path of a node, resolving a token Node path.
 */
export function resolveNodePath(node: NodePath<namedTypes.ObjectProperty>) {
  let currentPath = node
  const currentKeyPath: string[] = []

  while (currentPath.parent) {
    const path = currentPath?.value?.key?.value?.toString() || currentPath?.value?.key?.name?.toString()
    if (path) { currentKeyPath.push(path) }
    currentPath = currentPath?.parent || undefined
  }

  return currentKeyPath.filter(Boolean).reverse().join('.')
}
