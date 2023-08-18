import type { SourceLocation } from 'sfc-composer'
import type { namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import type { CSS } from './css'

export interface ComputedStyleContext { id: string; variable: string; source: string; compiled: string }

export interface PinceauCSSFunctionContext {
  // Source
  loc: SourceLocation
  declaration: CSS<any>
  ast: NodePath<namedTypes.ObjectExpression, any> & any

  // Compiled
  css: string
  variants: { [key: string]: any }
  localTokens: { [key: string]: string }
  computedStyles: ComputedStyleContext[]
}
