import type { PinceauStyleFunctionContext } from '../types'

export function hasIdentifier(styleFn: PinceauStyleFunctionContext) {
  const calleeType = styleFn.callee?.parentPath?.value?.type

  return (
    calleeType === 'VariableDeclarator'
    || calleeType === 'AssignmentExpression'
    || calleeType === 'JSXExpressionContainer'
  )
}
