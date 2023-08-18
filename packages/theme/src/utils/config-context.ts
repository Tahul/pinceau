import type { PinceauContext, PinceauOptions } from '@pinceau/core'
import type { PinceauConfigContext, ThemeGenerationOutput, ThemeLoadingOutput } from '../types'
import { loadLayers } from './config-layers'
import { generateTheme } from './generate'

export function usePinceauConfigContext(ctx: PinceauContext): PinceauConfigContext {
  let config: ThemeLoadingOutput
  let ready: Promise<any>

  /**
   * Fully reloads the configuration context.
   */
  async function buildTheme(newOptions?: PinceauOptions): Promise<ThemeGenerationOutput> {
    // Load the new configurations from options
    config = await loadLayers(newOptions || ctx.options)

    // Run all configResolved callbacks
    await Promise.all(ctx.options.theme.configResolved.map(cb => cb(config)))

    // Generate theme
    const output = await generateTheme(config, ctx)

    if (config.utils) { ctx.updateUtils(config.utils) }

    if (output.outputs) { ctx.updateOutputs(output.outputs) }

    if (output.theme) { ctx.updateTheme(output.theme) }

    // Run all configBuilt callbacks
    await Promise.all(ctx.options.theme.configBuilt.map(cb => cb(output)))

    return output
  }

  return {
    get ready() { return ready },
    get config() { return config },
    get sources() { return config?.sources },
    buildTheme: async (newOptions?: PinceauOptions) => {
      ready = buildTheme(newOptions)
      return await ready
    },
  }
}
