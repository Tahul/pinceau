import type { PinceauTransformFunction } from '@pinceau/core'
import type { PinceauCSSFunctionContext } from '../types'
import { resolveCSSCallees } from '../ast'
import { resolveCSSFunctionContext } from '../css-function-context'

export const transformCSSFunctions: PinceauTransformFunction = (
  transformContext,
  pinceauContext,
  write = false,
) => {
  const { target } = transformContext

  const cssFunctions: { [key: number]: PinceauCSSFunctionContext } = {}

  resolveCSSCallees(
    target.toString(),
    (node, index) => {
      // Resolve runtime styling context from AST of css() call
      const cssFunctionContext = resolveCSSFunctionContext(transformContext, pinceauContext, node, index)

      if (!cssFunctionContext) { return }

      cssFunctions[index] = cssFunctionContext

      // Rewrite source with result
      target.overwrite(
        node.value.start,
        node.value.end,
        write ? cssFunctionContext.css : '',
      )
    },
  )

  if (!transformContext.state.cssFunctions) { transformContext.state.cssFunctions = {} }

  transformContext.state.cssFunctions = { ...transformContext.state.cssFunctions, ...cssFunctions }
}
