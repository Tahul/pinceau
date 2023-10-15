import type { PinceauContext } from '@pinceau/core'
import * as formats from '../formats'
import * as tokensTransforms from './tokens-transformers'

export function setupThemeFormats(ctx: PinceauContext) {
  // Register local outputs formats
  Object.values(formats).forEach((newFormat) => {
    if (!ctx.options.theme.outputFormats.find(format => format.destination === newFormat.destination)) { ctx.options.theme.outputFormats.push(newFormat) }
  })

  // Register local tokens transforms
  Object.values(tokensTransforms).forEach((newTransform) => {
    if (!ctx.options.theme.tokensTransforms.find(transform => transform.name === newTransform.name)) { ctx.options.theme.tokensTransforms.push(newTransform) }
  })
}
