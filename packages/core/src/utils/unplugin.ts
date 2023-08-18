import type { PinceauContext, PinceauUnpluginTransform } from '../types'
import { loadFile } from './load'
import { usePinceauTransformContext } from './transform-context'

export function load(id: string, ctx: PinceauContext) {
  // Load virtual outputs
  const output = ctx.getOutput(id)
  if (output) { return output }

  // Load transform pipeline
  const query = ctx.transformed[id]
  if (!query) { return }

  // Load file
  let code = loadFile(query)
  if (!code) { return }

  // Apply load transformers
  code = ctx.applyTransformers(query, code)

  // Try to find block via transformer loader
  let block: string | undefined
  if (ctx.transformers[query.ext]) { block = ctx.transformers[query.ext].loadBlock(code, query) }

  // Return scoped contents
  return block || code
}

export function loadInclude(id: string, ctx: PinceauContext) {
  const query = ctx.isTransformable(id)

  // ALlow virtual outputs by default
  if (ctx.getOutput(id)) { return true }

  // Push included file into context
  if (query && query?.transformable) { ctx.addTransformed(id, query) }

  return !!query
}

export function transformInclude(id: string, ctx: PinceauContext) {
  const query = ctx.transformed[id]
  return !!query
}

export const transform: PinceauUnpluginTransform = (code, id, suite, ctx) => {
  const query = ctx.transformed[id]

  const transformContext = usePinceauTransformContext(code, query, ctx)

  transformContext.registerTransforms(suite)

  transformContext.transform()

  return transformContext.result()
}
