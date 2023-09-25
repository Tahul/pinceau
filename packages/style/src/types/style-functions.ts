import type { SourceLocation } from 'sfc-composer'
import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import type { PathMatch, PropMatch } from '@pinceau/core'
import type { ComputedStyleContext } from './computed-styles'
import type { Variants } from './variants'

export type CSSFunctionArgAST = NodePath<namedTypes.ObjectExpression> & ASTNode & { loc: namedTypes.SourceLocation }

export interface PinceauStyleFunctionContext {
  // Source
  type: 'css' | 'styled'
  pointer: string
  callee: PathMatch | PropMatch
  arg: CSSFunctionArgAST
  loc: SourceLocation
  declaration: any

  // Compiled
  className?: string
  css: string
  variants: Variants<any>
  localTokens: { [key: string]: NodePath<namedTypes.StringLiteral | namedTypes.NumericLiteral | namedTypes.FunctionExpression | namedTypes.ArrowFunctionExpression> & ASTNode }
  computedStyles: ComputedStyleContext[]
}
