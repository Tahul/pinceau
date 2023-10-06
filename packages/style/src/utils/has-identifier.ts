import type { PinceauStyleFunctionContext } from '../types'

export const hasIdentifier = (styleFn: PinceauStyleFunctionContext) => styleFn.callee?.parentPath?.value?.type === 'VariableDeclarator' || styleFn.callee?.parentPath?.value?.type === 'AssignmentExpression'
