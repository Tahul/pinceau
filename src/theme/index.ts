import type { ViteDevServer } from 'vite'
import type { LoadConfigResult, PinceauConfigContext, PinceauOptions, PinceauTheme } from '../types'
import { loadConfig } from './load'

export * from './define'
export * from './output'

export function usePinceauConfig<UserOptions extends PinceauOptions = PinceauOptions>(
  options: UserOptions,
  dispatchConfigUpdate?: (result: LoadConfigResult<PinceauTheme>) => void,
): PinceauConfigContext<UserOptions> {
  let cwd = options?.cwd ?? process.cwd()
  let sources: string[] = []
  let resolvedConfig: PinceauTheme = {} as any

  let ready = reloadConfig()

  async function reloadConfig(newOptions?: UserOptions): Promise<LoadConfigResult<PinceauTheme>> {
    if (!newOptions) { newOptions = options }

    const result = await loadConfig(newOptions || options)

    cwd = newOptions?.cwd ?? process.cwd()
    resolvedConfig = result.config
    sources = result.sources

    if (dispatchConfigUpdate) { dispatchConfigUpdate(result) }

    if (options?.configResolved) { options.configResolved(result.config) }

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
    if (!sources.length) { return }

    server.watcher.add(sources)

    server.watcher.on('change', async (p) => {
      if (!sources.includes(p)) { return }

      await reloadConfig()

      const _module = server.moduleGraph.getModuleById('/__pinceau_css.css')

      if (_module) {
        server.moduleGraph.invalidateModule(_module)
      }

      server.ws.send({
        type: 'update',
        updates: [
          {
            acceptedPath: '/__pinceau_css.css',
            path: '/__pinceau_css.css',
            timestamp: +Date.now(),
            type: 'js-update',
          },
        ],
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
