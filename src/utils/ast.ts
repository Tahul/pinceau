import type { SFCParseOptions } from 'vue/compiler-sfc'
import { parse as sfcParse } from 'vue/compiler-sfc'
import * as recast from 'recast'
import type { Options } from 'recast'
import { defu } from 'defu'
import { parse as tsParse } from 'recast/parsers/typescript.js'

/**
 * Parse AST with TypeScript parser.
 */
export function parseAst(source: string, options?: Partial<Options>): import('@babel/types').File {
  return recast.parse(source, defu({ parser: { parse: tsParse } }, options))
}

/**
 * Parse a Vue component with vue/compiler-sfc.
 */
export function parseVueComponent(source: string, options: Partial<SFCParseOptions> = {}) {
  return sfcParse(source, options)
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
 * Re-exports from recast.
 *
 * Might be useful in case Pinceau changes of AST parser.
 */
const visitAst = recast.visit
const printAst = recast.print
const astTypes = recast.types

export { visitAst, printAst, astTypes }
