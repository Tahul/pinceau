import process from 'node:process'
import type { PinceauContext, PinceauOptions } from '@pinceau/core'
import type { PinceauConfigContext, ResolvedConfig, ThemeGenerationOutput } from '../types'
import { loadLayers } from './layers'
import { generateTheme } from './generate'

export function usePinceauConfigContext(ctx: PinceauContext): PinceauConfigContext {
  let resolvedConfig: ResolvedConfig
  let ready: Promise<any> = buildTheme()

  /**
   * Fully reloads the configuration context.
   */
  async function buildTheme(newOptions?: PinceauOptions): Promise<ThemeGenerationOutput> {
    // Load the new configurations from options
    resolvedConfig = await loadLayers(newOptions || ctx.options)

    // Update local context from options
    ctx.options.cwd = newOptions?.cwd ?? process.cwd()

    // Dispatch configResolved hook
    ctx.options.theme.configResolved(resolvedConfig)

    // Generate theme
    const builtTheme = await generateTheme(resolvedConfig, ctx)

    if (resolvedConfig.utils) { ctx.updateUtils(resolvedConfig.utils) }

    if (builtTheme.outputs) { ctx.updateOutputs(builtTheme.outputs) }

    if (builtTheme.tokens) { ctx.updateTheme(builtTheme.tokens) }

    await ctx.options.theme.configBuilt(builtTheme)

    return builtTheme
  }

  /**
   * Updates the current cwd of that Pinceau config context.
   */
  async function updateCwd(newCwd: string) {
    if (newCwd !== ctx.options.cwd) {
      ctx.options.cwd = newCwd
      ready = buildTheme()
    }
    await ready
    return resolvedConfig
  }

  return {
    get ready() { return ready },
    get resolvedConfig() { return resolvedConfig },
    get sources() { return resolvedConfig?.sources },
    updateCwd,
    buildTheme,
  }
}
