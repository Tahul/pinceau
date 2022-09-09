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

      const css = server.moduleGraph.getModuleById('/__pinceau_css.css')
      const ts = server.moduleGraph.getModuleById('/__pinceau_ts.ts')

      // Send HMR updates for each
      Object.entries({ css, ts }).forEach(
        ([key, module]) => {
          if (!module) { return }

          server.moduleGraph.invalidateModule(module)

          ;['js', 'css'].forEach(
            (type: 'js' | 'css') => {
              server.ws.send({
                type: 'update',
                updates: [
                  {
                    acceptedPath: `/__pinceau_${key}.${key}`,
                    path: `/__pinceau_${key}.${key}`,
                    timestamp: +Date.now(),
                    type: `${type}-update`,
                  },
                ],
              })
            },
          )
        },
      )
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
