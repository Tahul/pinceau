import process from 'node:process'
import type { PinceauConfigContext, ResolvedConfig } from './types'
import type { PinceauContext, PinceauOptions } from '@pinceau/core'
import { outputFileNames } from '@pinceau/core'
import { loadLayers } from './layers'
import { generateTheme } from './generate'

export function usePinceauConfigContext(ctx: PinceauContext): PinceauConfigContext {
  let resolvedConfig: ResolvedConfig
  let ready = reloadConfig()

  /**
   * Fully reloads the configuration context.
   */
  async function reloadConfig(newOptions?: PinceauOptions): Promise<ResolvedConfig> {
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

    if (ctx.viteServer) {
      ctx.viteServer.ws.send({
        type: 'custom',
        event: 'pinceau:theme',
        data: {
          css: builtTheme.outputs['pinceau.css'],
          theme: builtTheme.tokens,
        },
      })
    }

    return resolvedConfig
  }

  /**
   * Updates the current cwd of that Pinceau config context.
   */
  async function updateCwd(newCwd: string) {
    if (newCwd !== ctx.options.cwd) {
      ctx.options.cwd = newCwd
      ready = reloadConfig()
    }
    return await ready
  }

  /**
   * Triggered when a configuration file has changed.
   */
  async function onConfigChange(p: string) {
    if (!resolvedConfig?.sources?.includes(p)) { return }

    await reloadConfig()

    // Virtual imports ids
    const ids = [...outputFileNames]

    // Use transformed files as well
    Object.entries(ctx.transformed).forEach(([path, value]) => value && !ids.includes(path) && ids.push(path))

    // Loop on ids
    for (const id of ids) {
      const _module = ctx.viteServer.moduleGraph.getModuleById(id)
      if (!_module) { continue }
      ctx.viteServer.reloadModule(_module)
    }
  }

  /**
   * Registers the watchers for the current configurations layers.
   */
  function registerConfigWatchers() {
    if (!resolvedConfig?.sources?.length) { return }
    ctx.viteServer.watcher.add(resolvedConfig.sources)
    ctx.viteServer.watcher.on('change', onConfigChange)
  }

  return {
    get ready() { return ready },
    get resolvedConfig() { return resolvedConfig },
    get sources() { return resolvedConfig?.sources },
    updateCwd,
    reloadConfig,
    registerConfigWatchers,
  }
}
