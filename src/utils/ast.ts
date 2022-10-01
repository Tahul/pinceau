import * as recast from 'recast'
import defu from 'defu'

/**
 * Parse ASt with TypeScript parser
 */
export function parseAst(source: string, options?: Partial<any>) {
  return recast.parse(source, defu({ parser: require('recast/parsers/typescript') }, options))
}

/**
 * Cast a `props.type` string into an AST declaration.
 */
export function propStringToAst(type: string) {
  const parsed = recast.parse(`const toAst = ${type}`, { parser: require('recast/parsers/typescript') })
  return parsed.program.body[0].declarations[0].init
}

const visitAst = recast.visit
const printAst = recast.print
const astTypes = recast.types

export { visitAst, printAst, astTypes }
