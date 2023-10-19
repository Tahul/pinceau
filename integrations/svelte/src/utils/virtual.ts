import { join } from 'pathe'
import type { PinceauContext } from '@pinceau/core'
import { writeOutput } from '@pinceau/core/utils'
import { createSveltePlugin } from './runtime-plugin'

/**
 * These target needs to be written.
 */
export function registerVirtualOutputs(ctx: PinceauContext) {
  const outputs: [string, string, string][] = [
    ['@pinceau/outputs/svelte-plugin', '/__pinceau_svelte_plugin.js', createSveltePlugin(ctx)],
  ]

  outputs.forEach(([importPath, virtualPath, content]) => ctx.registerOutput(importPath, virtualPath, content))

  // Write plugin & runtime exports outputs
  if (ctx.options.theme.buildDir) {
    writeOutput('@pinceau/outputs/svelte-plugin', join(ctx.options.theme.buildDir, 'svelte-plugin.js'), ctx)
  }
}
