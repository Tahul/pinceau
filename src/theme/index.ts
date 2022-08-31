import type { ViteDevServer } from 'vite'
import type { PinceauConfig, PinceauConfigContext, PinceauOptions } from '../types'
import type { LoadConfigResult } from './load'
import { loadConfig } from './load'

export * from './define'
export * from './output'

export function usePinceauConfig<UserOptions extends PinceauOptions = PinceauOptions>(
  options: UserOptions,
  dispatchConfigUpdate?: (result: LoadConfigResult<PinceauConfig>) => void,
): PinceauConfigContext<UserOptions> {
  let cwd = options?.cwd ?? process.cwd()
  let sources: string[] = []
  let resolvedConfig: PinceauConfig = {}

  let ready = reloadConfig()

  async function reloadConfig(newOptions?: UserOptions): Promise<LoadConfigResult<PinceauConfig>> {
    if (!newOptions)
      newOptions = options

    const result = await loadConfig(newOptions || options)

    cwd = newOptions?.cwd ?? process.cwd()
    resolvedConfig = result.config
    sources = result.sources

    if (dispatchConfigUpdate)
      dispatchConfigUpdate(result)

    if (options?.configResolved)
      options.configResolved(result.config)

    return result
  }

  async function getConfig() {
    await ready
    return resolvedConfig
  }

  async function updateCwd(newCwd: string) {
    if (newCwd !== cwd) {
      cwd = newCwd
      ready = reloadConfig()
    }
    return await ready
  }

  function registerConfigWatchers(server: ViteDevServer) {
    if (!sources.length)
      return

    server.watcher.add(sources)

    server.watcher.on('change', async (p) => {
      if (!sources.includes(p))
        return

      await reloadConfig()

      server.ws.send({
        type: 'custom',
        event: 'pinceau:config-changed',
      })
    })
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
    getConfig,
    registerConfigWatchers,
  }
}
