import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'

export type CSSFunctionSource = NodePath<namedTypes.ObjectExpression> & ASTNode & { loc: namedTypes.SourceLocation }

export type StyledFunctionSource = NodePath<namedTypes.ObjectExpression> & ASTNode & { loc: namedTypes.SourceLocation }

export type ComputedStyleSource = NodePath<namedTypes.MemberExpression> & ASTNode & { loc: namedTypes.SourceLocation }
