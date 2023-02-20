import type { ViteDevServer } from 'vite'
import type { LoadConfigResult, PinceauConfigContext, PinceauOptions, PinceauTheme } from '../types'
import { outputFileNames } from '../utils/regexes'
import { loadLayers } from './layers'

export function usePinceauConfigContext<UserOptions extends PinceauOptions = PinceauOptions>(
  options: UserOptions,
  getViteServer: () => ViteDevServer,
  getTransformed: () => string[],
  dispatchConfigUpdate?: (result: LoadConfigResult<PinceauTheme>) => void,
): PinceauConfigContext<UserOptions> {
  let cwd = options?.cwd ?? process.cwd()
  let sources: string[] = []
  let resolvedConfig: any = {}
  let ready = reloadConfig()

  /**
   * Fully reloads the configuration context.
   */
  async function reloadConfig(newOptions: UserOptions = options): Promise<LoadConfigResult<PinceauTheme>> {
    // Load the new configurations from options
    const result = await loadLayers(newOptions || options)

    // Update local context from options
    cwd = newOptions?.cwd ?? process.cwd()
    resolvedConfig = result.config
    sources = result.sources

    // Dispatch listeners
    if (dispatchConfigUpdate) { dispatchConfigUpdate(result) }
    if (options?.configResolved) { options.configResolved(result) }

    return result
  }

  /**
   * Updates the current cwd of that Pinceau config context.
   */
  async function updateCwd(newCwd: string) {
    if (newCwd !== cwd) {
      cwd = newCwd
      ready = reloadConfig()
    }
    return await ready
  }

  /**
   * Triggered when a configuration file has changed.
   */
  async function onConfigChange(p: string) {
    if (!sources.includes(p)) { return }

    const viteServer = getViteServer()

    await reloadConfig()

    // Virtual imports ids
    const ids = [...outputFileNames]

    // Use transformed files as well
    getTransformed().forEach(transformed => !ids.includes(transformed) && ids.push(transformed))

    // Loop on ids
    for (const id of ids) {
      const _module = viteServer.moduleGraph.getModuleById(id)
      if (!_module) { continue }
      viteServer.reloadModule(_module)
    }
  }

  /**
   * Registers the watchers for the current configurations layers.
   */
  function registerConfigWatchers() {
    if (!sources.length) { return }
    const viteServer = getViteServer()
    viteServer.watcher.add(sources)
    viteServer.watcher.on('change', onConfigChange)
  }

  return {
    get ready() {
      return ready
    },
    get cwd() {
      return cwd
    },
    updateCwd,
    sources,
    reloadConfig,
    resolvedConfig,
    registerConfigWatchers,
  }
}
