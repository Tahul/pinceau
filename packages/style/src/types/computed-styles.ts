import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'
import type { GeneratedPinceauMediaQueries as PinceauMediaQueries } from '$pinceau/theme'

export type ComputedStyleSource = NodePath<namedTypes.MemberExpression> & ASTNode & { loc: namedTypes.SourceLocation }

export interface ComputedStyleContext {
  id: string
  variable: string
  ast: ComputedStyleSource
  compiled: string
}

export type ComputedStyleDefinition<T extends { [key: string | number]: any } = {}> = (props?: T) => string | number | undefined | { [key in PinceauMediaQueries]?: string | number | undefined }
