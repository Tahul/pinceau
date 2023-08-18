import type { PinceauTransformFunction } from '@pinceau/core'
import type { PinceauCSSFunctionContext } from '../types'
import { resolveCSSCallees } from '../utils/ast'
import { resolveCSSFunctionContext } from '../utils/css-function-context'

export const transformCSSFunctions: PinceauTransformFunction = (
  transformContext,
  pinceauContext,
  write = false,
) => {
  const { target } = transformContext

  if (!transformContext.state.cssFunctions) { transformContext.state.cssFunctions = [] }

  const callees = resolveCSSCallees(target.toString())

  for (let i = 0; i < callees.length; i++) {
    const callee = callees[i]

    // Resolve runtime styling context from AST of css() call
    const cssFunctionContext = resolveCSSFunctionContext(transformContext, pinceauContext, callee, i)

    if (!cssFunctionContext) { return }

    transformContext.state.cssFunctions.push(cssFunctionContext)

    // Rewrite source with result
    target.overwrite(
      callee.value.start,
      callee.value.end,
      write ? cssFunctionContext.css : '',
    )
  }
}
