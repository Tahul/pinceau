import type { ASTNode, namedTypes } from 'ast-types'
import type { NodePath } from 'ast-types/lib/node-path'

export type PathMatch = (NodePath<namedTypes.CallExpression> & ASTNode & { match: string | RegExpMatchArray } & { [key: string]: any })
