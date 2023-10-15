import type { PinceauContext, PinceauOptions } from '@pinceau/core'
import { getPinceauContext } from '@pinceau/core/utils'
import type { ResolvedConfig } from 'vite'
import type { PinceauConfigContext, ThemeGenerationOutput, ThemeLoadingOutput } from '../types'
import { loadLayers } from './config-layers'
import { generateTheme } from './generate'
import { createThemeHelper } from './theme-helper'

/**
 * Retrieves previously injected PinceauConfigContext inside ViteDevServer to reuse context across plugins.
 */
export function getPinceauConfigContext(config: ResolvedConfig): PinceauConfigContext {
  const pinceauContext = getPinceauContext(config)

  if (pinceauContext?.configContext) { return pinceauContext?.configContext }

  throw new Error('You tried to use a Pinceau theme plugin without previously injecting the @pinceau/theme plugin.')
}

export function usePinceauConfigContext(ctx: PinceauContext): PinceauConfigContext {
  let config: ThemeLoadingOutput
  let ready: Promise<any>

  ctx.setThemeFunction(createThemeHelper)

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
