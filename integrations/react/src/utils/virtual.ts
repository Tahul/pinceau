import fs from 'node:fs'
import { join } from 'pathe'
import type { PinceauContext } from '@pinceau/core'
import { writeOutput } from '@pinceau/core/utils'
import { createReactPlugin } from './runtime-plugin'

/**
 * These target needs to be written.
 */
export function registerVirtualOutputs(ctx: PinceauContext) {
  const outputs: [string, string, string][] = [
    ['@pinceau/outputs/react-plugin', '/__pinceau_react_plugin.js', createReactPlugin(ctx)],
  ]

  outputs.forEach(([importPath, virtualPath, content]) => ctx.registerOutput(importPath, virtualPath, content))

  // Write plugin & runtime exports outputs
  if (ctx.options.theme.buildDir) {
    writeOutput('@pinceau/outputs/react-plugin', join(ctx.options.theme.buildDir, 'react-plugin.js'), ctx)
  }
}
