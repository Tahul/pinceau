import * as recast from 'recast'
import type { Options as RecastOptions } from 'recast'
import { parse as tsParse } from 'recast/parsers/typescript.js'
import type { File } from '@babel/types'
import type { namedTypes } from 'ast-types'
import { NodePath } from 'ast-types/lib/node-path'

/**
 * Parse AST with TypeScript parser.
 */
export function parseAst(source: string, options?: Partial<RecastOptions>): File {
  return recast.parse(source, { ...options, parser: { parse: tsParse, ...(options?.parser || {}) } })
}

/**
 * Cast any JS string into an AST declaration.
 */
export function expressionToAst(type: string, leftSide = 'const toAst = ') {
  const parsed = recast.parse(`${leftSide}${type}`, { parser: { parse: tsParse } })
  return parsed.program.body[0].declarations[0].init
}

/**
 * Gets the default export from an AST node.
 */
export function findDefaultExport(node: File): NodePath<namedTypes.ExportDefaultDeclaration> {
  return (node.program.body.find(n => n.type === 'ExportDefaultDeclaration') as any)?.declaration
}

/**
 * Re-exports from recast.
 *
 * Might be useful in case Pinceau changes of AST parser.
 */

/* c8 ignore start */
export const visitAst = recast.visit
export const printAst = recast.print
export const astTypes = recast.types
