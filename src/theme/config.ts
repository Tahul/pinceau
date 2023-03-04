import type { PinceauBuildContext, PinceauConfigContext, PinceauOptions, ResolvedConfig } from '../types'
import { outputFileNames } from '../utils/regexes'
import { loadLayers } from './layers'

export function usePinceauConfigContext<UserOptions extends PinceauOptions = PinceauOptions>(
  buildContext: PinceauBuildContext,
  dispatchConfigUpdate?: (result: ResolvedConfig) => void | Promise<void>,
): PinceauConfigContext {
  const sources: string[] = []
  let resolvedConfig: ResolvedConfig
  let ready = reloadConfig()

  /**
   * Fully reloads the configuration context.
   */
  async function reloadConfig(newOptions?: UserOptions): Promise<ResolvedConfig> {
    // Load the new configurations from options
    resolvedConfig = await loadLayers(newOptions || buildContext.options)

    // Update local context from options
    buildContext.options.cwd = newOptions?.cwd ?? process.cwd()

    // Dispatch listeners
    if (dispatchConfigUpdate) { await dispatchConfigUpdate(resolvedConfig) }
    if (buildContext.options?.configResolved) { buildContext.options.configResolved(resolvedConfig) }

    return resolvedConfig
  }

  /**
   * Updates the current cwd of that Pinceau config context.
   */
  async function updateCwd(newCwd: string) {
    if (newCwd !== buildContext.options.cwd) {
      buildContext.options.cwd = newCwd
      ready = reloadConfig()
    }
    return await ready
  }

  /**
   * Triggered when a configuration file has changed.
   */
  async function onConfigChange(p: string) {
    if (!sources.includes(p)) { return }

    await reloadConfig()

    // Virtual imports ids
    const ids = [...outputFileNames]

    // Use transformed files as well
    buildContext.transformed.forEach(transformed => !ids.includes(transformed) && ids.push(transformed))

    // Loop on ids
    for (const id of ids) {
      const _module = buildContext.viteServer.moduleGraph.getModuleById(id)
      if (!_module) { continue }
      buildContext.viteServer.reloadModule(_module)
    }
  }

  /**
   * Registers the watchers for the current configurations layers.
   */
  function registerConfigWatchers() {
    if (!sources.length) { return }
    buildContext.viteServer.watcher.add(sources)
    buildContext.viteServer.watcher.on('change', onConfigChange)
  }

  return {
    get ready() { return ready },
    get resolvedConfig() { return resolvedConfig },
    get sources() { return sources },
    updateCwd,
    reloadConfig,
    registerConfigWatchers,
  }
}
