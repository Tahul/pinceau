import * as recast from 'recast'
import type { ParserOptions } from '@babel/parser'
import { parse as babelParse } from '@babel/parser'
import { parse as tsParse } from 'recast/parsers/typescript.js'
import { parse as htmlParse, walkSync as walkHtml } from 'ultrahtml'
import type { File } from '@babel/types'
import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import type { PathMatch } from '../types/ast'

/**
 * Parse AST with TypeScript parser.
 */
export function parseAst(source: string, options?: Partial<ParserOptions>): File {
  return babelParse(source, { plugins: ['typescript', 'jsx'], sourceType: 'unambiguous', ...options })
}

/**
 * Parse HTML/<template> to AST using ultrahtml.
 */
export function parseTemplate(source: string) {
  return htmlParse(source)
}

/**
 * Cast any JS string into an AST declaration.
 */
export function expressionToAst(type: string, leftSide = 'const toAst = ') {
  const parsed = recast.parse(`${leftSide}${type}`, { parser: { parse: tsParse } })
  return parsed.program.body[0].declarations[0].init
}

/**
 * Cast any TS type expression into an AST declaration.
 */
export function typeToAst(type: string, leftSide = 'type toType = ') {
  const parsed = recast.parse(`${leftSide}${type}`, { parser: { parse: tsParse } })
  return parsed.program.body[0].typeAnnotation
}

/**
 * Gets the default export from an AST node.
 */
export function findDefaultExport(node: File): NodePath<namedTypes.ExportDefaultDeclaration> & ASTNode {
  return (node.program.body.find(n => n.type === 'ExportDefaultDeclaration') as any)?.declaration
}

/**
 * Find all calls of css(), styled and $styled and call a callback on each.
 */
export function findCallees(ast: ASTNode, functionName: string | RegExp) {
  const isRegexMatch = !(typeof functionName === 'string')
  const paths: PathMatch[] = []

  recast.visit(
    ast,
    {
      visitCallExpression(path: PathMatch) {
        let search: string | undefined

        // Finds $styled.a()
        if (path?.value?.callee?.type === 'MemberExpression') { search = `${path?.value?.callee?.object?.name}.${path?.value?.callee?.property?.name}` }

        // Finds `styled` & `css`
        if (path?.value?.callee?.type === 'Identifier') { search = path?.value?.callee?.name }

        if (!search) { return this.traverse(path) }

        const isMatch = isRegexMatch
          ? search.match(functionName)
          : search === functionName
            ? search
            : false

        // console.log({ search, isMatch })

        if (isMatch) {
          path.match = isRegexMatch ? isMatch : functionName
          paths.push(path as PathMatch)
        }

        return this.traverse(path)
      },
    },
  )

  return paths
}

export function getCharAfterLastImport(ast: ASTNode) {
  let lastImportEndPos = 0

  recast.visit(ast, {
    visitImportDeclaration(path) {
      // Capture the end position of each import statement
      lastImportEndPos = path.value.end

      // Continue traversal
      return this.traverse(path)
    },
  })

  // Return the next character position after the last import statement
  return lastImportEndPos
}

/**
 * Re-exports from recast.
 *
 * Might be useful in case Pinceau changes of AST parser.
 */

/* c8 ignore start */
export const walkTemplate = walkHtml
export const visitAst = recast.visit
export const printAst = recast.print
export const astTypes = recast.types
