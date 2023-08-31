import type { PinceauContext, PinceauTransformContext } from '@pinceau/core'
import { findCallees, parseAst } from '@pinceau/core/utils'
import { resolveStyleFunctionContext } from '../utils/style-function-context'
import { elements } from '../utils/html-elements'

export function transformStyleFunctions(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
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
    const styleFunctionContext = resolveStyleFunctionContext(
      transformContext,
      pinceauContext,
      callee,
      id,
    )

    if (!styleFunctionContext) { return }

    // Remove source; this should leave component compilable without caring if the resolved context is consumed elsewhere
    target.overwrite(
      callee.value.start,
      callee.value.end,
      styleFunctionContext.pointer,
    )

    transformContext.state.styleFunctions[id] = styleFunctionContext
  }
}
