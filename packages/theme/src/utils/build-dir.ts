import { join } from 'pathe'
import type { PinceauContext } from '@pinceau/core'
import { configSourceFromModulePath } from './module-path'

export function resolveBuildDir(ctx: PinceauContext) {
  const { buildDir: optionsBuildDir } = ctx.options.theme

  let buildDir = optionsBuildDir

  // Enforce ending slash for buildDir
  if (buildDir && !buildDir.endsWith('/')) {
    buildDir += '/'
  }

  // Try to resolve using common module path resolve
  if (buildDir === undefined && ctx.options.cwd && ctx.options.resolve) {
    buildDir = configSourceFromModulePath('@pinceau/outputs', ctx)?.path
  }

  // Try to resolve using path join
  if (buildDir === undefined && ctx.options.cwd) {
    buildDir = join(ctx.options.cwd, 'node_modules/@pinceau/outputs/')
  }

  return buildDir
}
