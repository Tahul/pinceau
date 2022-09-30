import * as recast from 'recast'
import * as parser from 'recast/parsers/typescript'
import defu from 'defu'

/**
 * Parse ASt with TypeScript parser
 */
export function parseAst(source: string, options?: Partial<any>) {
  return recast.parse(source, defu({ parser }, options))
}

/**
 * Cast a `props.type` string into an AST declaration.
 */
export function propStringToAst(type: string) {
  const parsed = recast.parse(`const toAst = ${type}`, { parser })
  return parsed.program.body[0].declarations[0].init
}

export { visit as visitAst, print as printAst, types as astTypes } from 'recast'
