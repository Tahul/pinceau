import type { SFCParseOptions } from 'vue/compiler-sfc'
import { parse as sfcParse } from 'vue/compiler-sfc'
import * as recast from 'recast'
import type { Options } from 'recast'
import { defu } from 'defu'
import { parse as tsParse } from 'recast/parsers/typescript'
import { render as _renderHtml, walk as _walkHtml, parse as parseHtml } from './ultrahtml'

/**
 * Parse AST with TypeScript parser.
 */
export function parseAst(source: string, options?: Partial<Options>) {
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
export function propStringToAst(type: string) {
  const parsed = recast.parse(`const toAst = ${type}`, { parser: { parse: tsParse } })
  return parsed.program.body[0].declarations[0].init
}

export function parseTemplate(code: string) {
  return parseHtml(code)
}

/**
 * Re-exports from ultrahtml.
 */
const walkHtml = _walkHtml
const renderHtml = _renderHtml

/**
 * Re-exports from recast.
 *
 * Might be useful in case Pinceau changes of AST parser.
 */
const visitAst = recast.visit
const printAst = recast.print
const astTypes = recast.types

export { visitAst, printAst, astTypes, walkHtml, renderHtml }
