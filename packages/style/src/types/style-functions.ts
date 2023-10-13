import type { SourceLocation } from 'sfc-composer'
import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import type { PathMatch, PropMatch } from '@pinceau/core'
import type { ComputedStyleContext } from './computed-styles'
import type { Variants } from './variants'
import type { SupportedHTMLElements } from './dom-elements'

export type CSSFunctionArgAST = NodePath<namedTypes.ObjectExpression> & ASTNode & { loc: namedTypes.SourceLocation }

export interface RuntimeParts {
  staticClass?: string
  computedStyles?: string | undefined
  variants?: string | undefined
}

export interface PinceauStyleFunctionContext {
  // Source
  id: string
  type: 'css' | 'styled' | '$styled'
  element?: SupportedHTMLElements
  helpers: ('withVariants' | 'withAttrs' | 'withProps')[]
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
  applied: {
    static: boolean
    runtime: boolean
  }
}
