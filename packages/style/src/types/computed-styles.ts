import type { PinceauMediaQueries } from '@pinceau/theme'
import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import type { PropertyValue } from './resolvers'

export type ComputedStyleSource = NodePath<namedTypes.MemberExpression> & ASTNode & { loc: namedTypes.SourceLocation }

export interface ComputedStyleContext {
  id: string
  variable: string
  ast: ComputedStyleSource
  compiled: string
}

export type ComputedStyleDefinition<T extends string | number> = () => PropertyValue<T> | T | { [key in PinceauMediaQueries]?: T | PropertyValue<T> }
