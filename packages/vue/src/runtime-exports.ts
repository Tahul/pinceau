import type { PinceauContext } from '@pinceau/core'

export function createRuntimeExports(ctx: PinceauContext) {
  return 'export { useVariants, useComputedStyle, useRuntimeSheet, useThemeSheet } from \'@pinceau/vue/runtime\''
}
