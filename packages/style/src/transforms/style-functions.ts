import type { PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'
import { findCallees, parseAst } from '@pinceau/core/utils'
import { resolveStyleFunctionContext } from '../utils/style-function-context'
import { elements } from '../utils/html-elements'

export const transformStyleFunctions: PinceauTransformFunction = async (
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) => {
  const { target } = transformContext

  if (!transformContext.state.styleFunctions) { transformContext.state.styleFunctions = {} }

  const ast = parseAst(target.toString())
  const cssCallees = findCallees(ast, 'css')
  const styledCallees = findCallees(ast, new RegExp(`^styled(\\.(${elements.join('|')}))?`))

  const callees = cssCallees.concat(styledCallees)

  for (let i = 0; i < callees.length; i++) {
    const callee = callees[i]

    const type = Array.isArray(callee.match) ? 'styled' : 'css'

    const id = `${target.type}${target.index}_${type}${i}`

    // Resolve runtime styling context from AST of css() call
    const styleFunctionContext = await resolveStyleFunctionContext(
      transformContext,
      pinceauContext,
      callee,
      id,
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

    transformContext.state.styleFunctions[id] = styleFunctionContext
  }
}
