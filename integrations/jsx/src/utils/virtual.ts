import { join } from 'pathe'
import type { PinceauContext } from '@pinceau/core'
import { createReactPlugin } from './runtime-plugin'
import { createRuntimeExports } from './runtime-exports'

/**
 * These target needs to be written.
 */
export function registerVirtualOutputs(ctx: PinceauContext) {
  const outputs: [string, string, string][] = [
    ['$pinceau', '/__pinceau_runtime.js', createRuntimeExports()],
    ['$pinceau/react-plugin', '/__pinceau_react_plugin.js', createReactPlugin(ctx)],
  ]

  outputs.forEach(([importPath, virtualPath, content]) => ctx.registerOutput(importPath, virtualPath, content))

  // Write plugin & runtime exports outputs
  if (ctx.options.theme.buildDir) {
    ctx.writeOutput('$pinceau', join(ctx.options.theme.buildDir, 'runtime.js'))
    ctx.writeOutput('$pinceau/react-plugin', join(ctx.options.theme.buildDir, 'react-plugin.js'))
  }
}
