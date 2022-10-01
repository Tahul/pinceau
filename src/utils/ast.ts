import type { SFCParseOptions } from 'vue/compiler-sfc'
import { parse as sfcParse } from 'vue/compiler-sfc'
import * as recast from 'recast'
import type { Options } from 'recast'
import defu from 'defu'

/**
 * Parse AST with TypeScript parser.
 */
export function parseAst(source: string, options?: Partial<Options>) {
  return recast.parse(source, defu({ parser: require('recast/parsers/typescript') }, options))
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
export function propStringToAst(type: string) {
  const parsed = recast.parse(`const toAst = ${type}`, { parser: require('recast/parsers/typescript') })
  return parsed.program.body[0].declarations[0].init
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
