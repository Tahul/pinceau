import type { PinceauMediaQueries } from '@pinceau/theme'
import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'

export type ComputedStyleSource = NodePath<namedTypes.MemberExpression> & ASTNode & { loc: namedTypes.SourceLocation }

export interface ComputedStyleContext {
  id: string
  variable: string
  ast: ComputedStyleSource
  compiled: string
}

export type ComputedStyleDefinition = () => string | number | undefined | { [key in PinceauMediaQueries]?: string | number | undefined }

css({
  test: {
    color: () => ({

    }),
  },
})
