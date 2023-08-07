import type { PinceauContext } from '@pinceau/core'

export function createRuntimeExports(ctx: PinceauContext) {
  return 'export { useVariants, useComputedStyle, useStylesheet } from \'@pinceau/vue/runtime\''
}
