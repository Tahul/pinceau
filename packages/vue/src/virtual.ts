import type { PinceauContext } from '@pinceau/core'
import { createVuePlugin } from './runtime-plugin'
import { createRuntimeExports } from './runtime-exports'

/**
 * These target needs to be written.
 */
export function registerVirtualOutputs(ctx: PinceauContext) {
  const outputs: [string, string, string][] = [
    ['$pinceau/runtime', '/__pinceau_runtime.ts', createRuntimeExports(ctx)],
    ['$pinceau/vue-plugin', '/__pinceau_vue_plugin.ts', createVuePlugin(ctx)],
  ]

  outputs.forEach(([importPath, virtualPath, content]) => ctx.registerOutput(importPath, virtualPath, content))
}
