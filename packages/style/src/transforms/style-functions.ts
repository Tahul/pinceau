import type { PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { findCallees, parseAst } from '@pinceau/core/utils'
import { resolveStyleFunctionContext } from '../utils/style-function-context'
import { IDENTIFIER_REGEX, PRESENCE_REGEX } from '../utils/regexes'

export const transformStyleFunctions: PinceauTransformFunction = async (
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) => {
  const { target } = transformContext

  const code = target.toString()

  // Avoid useless AST traversal as we can guess if the required syntax is present at string level.
  if (!code.match(PRESENCE_REGEX)) { return }

  if (!transformContext.state.styleFunctions) { transformContext.state.styleFunctions = {} }

  const ast = target?.ast || parseAst(code)

  const callees = findCallees(ast, IDENTIFIER_REGEX)

  for (let i = 0; i < callees.length; i++) {
    const callee = callees[i]

    // Resolve runtime styling context from AST of css() call
    const styleFunctionContext = await resolveStyleFunctionContext(
      transformContext,
      pinceauContext,
      callee,
      i,
    )

    if (!styleFunctionContext) { return }

    // If target is `<style>`, erase css() function as early as possible to prevent evaluation as CSS.
    if (target.type === 'style') {
      target.overwrite(
        callee.value.start,
        callee.value.end,
        `/* ${styleFunctionContext.pointer} */`,
      )
    }

    transformContext.state.styleFunctions[styleFunctionContext.id] = styleFunctionContext
  }
}
