import { join } from 'pathe'
import type { PinceauContext } from '@pinceau/core'
import { createSveltePlugin } from './runtime-plugin'
import { createRuntimeExports } from './runtime-exports'

/**
 * These target needs to be written.
 */
export function registerVirtualOutputs(ctx: PinceauContext) {
  const outputs: [string, string, string][] = [
    ['$pinceau', '/__pinceau_runtime.js', createRuntimeExports()],
    ['$pinceau/svelte-plugin', '/__pinceau_svelte_plugin.js', createSveltePlugin(ctx)],
  ]

  outputs.forEach(([importPath, virtualPath, content]) => ctx.registerOutput(importPath, virtualPath, content))

  // Write plugin & runtime exports outputs
  if (ctx.options.theme.buildDir) {
    ctx.writeOutput('$pinceau', join(ctx.options.theme.buildDir, 'runtime.js'))
    ctx.writeOutput('$pinceau/svelte-plugin', join(ctx.options.theme.buildDir, 'svelte-plugin.js'))
  }
}
