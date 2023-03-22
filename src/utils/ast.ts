import * as recast from 'recast'
import type { Options } from 'recast'
import { defu } from 'defu'
import { parse as tsParse } from 'recast/parsers/typescript.js'
import type { File } from '@babel/types'
import type { ASTNode } from 'ast-types'

/**
 * Parse AST with TypeScript parser.
 */
export function parseAst(source: string, options?: Partial<Options>): File {
  return recast.parse(source, defu({ parser: { parse: tsParse } }, options))
}

/**
 * Cast a `props.type` string into an AST declaration.
 */
export function expressionToAst(type: string, leftSide = 'const toAst = ', kind: 'js' | 'ts' = 'js') {
  const parsed = recast.parse(`${leftSide}${type}`, { parser: { parse: tsParse } })
  return kind === 'js'
    ? parsed.program.body[0].declarations[0].init
    : parsed.program.body[0].typeAnnotation
}

/**
 * Gets the default export from an AST node.
 */
export function defaultExport(node: File): ASTNode {
  return (node.program.body.find(n => n.type === 'ExportDefaultDeclaration') as any)?.declaration
}

/**
 * Re-exports from recast.
 *
 * Might be useful in case Pinceau changes of AST parser.
 */
const visitAst = recast.visit
const printAst = recast.print
const astTypes = recast.types

export { visitAst, printAst, astTypes }
