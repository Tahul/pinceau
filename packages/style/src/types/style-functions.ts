import type { SourceLocation } from 'sfc-composer'
import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import type { PathMatch, PropMatch } from '@pinceau/core'
import type { elements } from '../utils/html-elements'
import type { CSS } from './css'
import type { ComputedStyleContext } from './computed-styles'
import type { Variants } from './variants'

export type CSSFunctionArg = NodePath<namedTypes.ObjectExpression> & ASTNode & { loc: namedTypes.SourceLocation }

export type SupportedHTMLElements = typeof elements[number]

export interface PinceauStyleFunctionContext {
  // Source
  type: 'css' | 'styled'
  pointer: string
  callee: PathMatch | PropMatch
  arg: CSSFunctionArg
  loc: SourceLocation
  declaration: CSS<any, any>

  // Compiled
  className?: string
  css: string
  variants: Variants<any>
  localTokens: { [key: string]: NodePath<namedTypes.ObjectProperty | namedTypes.StringLiteral | namedTypes.NumericLiteral | namedTypes.FunctionExpression | namedTypes.ArrowFunctionExpression> & ASTNode }
  computedStyles: ComputedStyleContext[]
}
