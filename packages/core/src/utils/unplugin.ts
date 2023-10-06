import type { PinceauContext, PinceauUnpluginTransform } from '../types'
import { loadFile } from './load'
import { usePinceauTransformContext } from './transform-context'

export function resolveId(id: string, ctx: PinceauContext) {
  if (id.startsWith('$pinceau/style-functions.css?src=')) { return id }

  return ctx.getOutputId(id)
}

export function loadInclude(id: string, ctx: PinceauContext) {
  // Style function direct import
  if (id.startsWith('$pinceau/style-functions.css')) { return true }

  // Parse query
  const query = ctx.isTransformable(id)

  // ALlow virtual outputs by default
  if (ctx.getOutput(id)) { return true }

  // Push included file into context
  if (query && query?.transformable) { ctx.addTransformed(id, query) }

  return !!query
}

export async function load(id: string, ctx: PinceauContext) {
  // Load style functions
  if (id.startsWith('$pinceau/style-functions.css')) {
    return ctx.getStyleFunction(id)?.css
  }

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
  if (ctx.transformers[query.ext]) { block = await ctx.transformers[query.ext].loadBlock(code, query, ctx) }

  // Return scoped contents
  return block || code
}

export function transformInclude(id: string, ctx: PinceauContext) {
  const query = ctx.transformed[id]
  return !!query
}

export const transform: PinceauUnpluginTransform = async (code, id, suite, ctx) => {
  const query = ctx.transformed[id]

  const transformContext = usePinceauTransformContext(code, query, ctx)

  transformContext.registerTransforms(suite)

  await transformContext.transform()

  return transformContext.result()
}
