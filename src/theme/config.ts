import { resolve } from 'path'
import { existsSync } from 'fs'
import { defu } from 'defu'
import jiti from 'jiti'
import type { Update, ViteDevServer } from 'vite'
import { logger } from '../utils/logger'
import type { ConfigLayer, LoadConfigResult, PinceauConfigContext, PinceauOptions, PinceauTheme, ResolvedConfigLayer } from '../types'

const extensions = ['.js', '.ts', '.mjs', '.cjs']

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

      const ids = [
        '\0/__pinceau_css.css',
        '\0/__pinceau_ts.ts',
        '\0/__pinceau_js.js',
        '\0/__pinceau_flat_ts.ts',
        '\0/__pinceau_flat_js.js',
        '#pinceau/theme',
        '#pinceau/theme/flat',
      ]

      const updates: Update[] = []

      for (const id of ids) {
        const _module = server.moduleGraph.getModuleById(id)

        if (!_module) { continue }

        server.moduleGraph.invalidateModule(_module)

        if (id.endsWith('.css')) {
          updates.push({
            type: 'css-update',
            path: `/@id/__x00__${_module.url}`,
            acceptedPath: `/@id/__x00__${_module.url}`,
            timestamp: +Date.now(),
          })
        }
        else {
          updates.push({
            type: 'js-update',
            path: `/@id/__x00__${_module.url}`,
            acceptedPath: `/@id/__x00__${_module.url}`,
            timestamp: +Date.now(),
          })
        }
      }

      server.ws.send({
        type: 'update',
        updates,
      })

      // TODO: Temporary hotfix for reload on config change
      server.ws.send({
        type: 'full-reload',
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

export async function loadConfig<U extends PinceauTheme>(
  {
    cwd = process.cwd(),
    configOrPaths = [cwd],
    configFileName = 'pinceau.config',
    debug = false,
  }: PinceauOptions,
): Promise<LoadConfigResult<U>> {
  let _sources: string[] = []
  let inlineConfig = {} as U

  if (Array.isArray(configOrPaths)) { _sources = configOrPaths }

  if (typeof configOrPaths === 'string') { _sources = [configOrPaths] }

  // Inline config; overwrites any other configuration
  if (Object.prototype.toString.call(configOrPaths) === '[object Object]') {
    inlineConfig = configOrPaths as U
    return { config: inlineConfig, sources: [] }
  }

  let sources: ConfigLayer[] = [
    {
      cwd,
      configFileName,
    },
    ..._sources.reduce(
      (acc: ConfigLayer[], layerOrPath: string | ConfigLayer) => {
        if (typeof layerOrPath === 'object') {
          acc.push(layerOrPath as ConfigLayer)
          return acc
        }

        // process.cwd() already gets scanned by default
        if (resolve(cwd, layerOrPath) === resolve(cwd)) { return acc }

        acc.push({
          cwd: layerOrPath,
          configFileName,
        })

        return acc
      },
      [],
    ),
  ].reverse()

  // Dedupe sources
  sources = sources.reduce<ConfigLayer[]>(
    (acc, source) => {
      let searchable: string
      if (typeof source === 'string') {
        searchable = source
      }
      else {
        searchable = source?.cwd || ''
      }

      if (!acc.find((s: any) => s.cwd === searchable)) {
        acc.push({
          cwd: searchable,
          configFileName,
        })
      }

      return acc
    },
    [],
  )

  const resolveConfig = <U extends PinceauTheme>(layer: ConfigLayer): ResolvedConfigLayer<U> => {
    const empty = () => ({ path: undefined, config: {} as any })

    let path = ''

    // Resolve config path from layer
    if (typeof layer === 'string') {
      path = resolve(layer)
    }
    else if (typeof layer === 'object') {
      path = resolve(layer?.cwd || cwd, layer?.configFileName || configFileName)
    }
    else {
      return empty()
    }

    let filePath = ''
    extensions.some((ext) => {
      if (existsSync(path + ext)) {
        filePath = path + ext
        return true
      }
      return false
    })

    if (!filePath) { return empty() }

    if (filePath) {
      try {
        return loadConfigFile(filePath) as ResolvedConfigLayer<U>
      }
      catch (e) {
        if (debug) { logger.error({ filePath, e }) }
        return empty()
      }
    }

    return empty()
  }

  const result: LoadConfigResult<U> = {
    config: {} as any,
    sources: [] as string[],
  }

  for (const layer of sources) {
    const { path, config } = resolveConfig(layer)

    if (path) {
      result.sources.push(path)
    }

    if (config) {
      result.config = defu(config, result.config) as U
    }
  }

  return result
}

function loadConfigFile(path: string) {
  return {
    config: jiti(path, {
      interopDefault: true,
      requireCache: false,
      esmResolve: true,
    })(path),
    path,
  }
}
