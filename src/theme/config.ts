import { existsSync } from 'fs'
import { resolve } from 'pathe'
import jiti from 'jiti'
import type { Update, ViteDevServer } from 'vite'
import { merger } from '../utils/merger'
import { message } from '../utils/logger'
import type { ConfigLayer, LoadConfigResult, PinceauConfigContext, PinceauOptions, PinceauTheme, ResolvedConfigLayer } from '../types'

const extensions = ['.js', '.ts', '.mjs', '.cjs']

export function usePinceauConfig<UserOptions extends PinceauOptions = PinceauOptions>(
  options: UserOptions,
  getViteServer: () => ViteDevServer,
  getTransformed: () => string[],
  dispatchConfigUpdate?: (result: LoadConfigResult<PinceauTheme>) => void,
): PinceauConfigContext<UserOptions> {
  let cwd = options?.cwd ?? process.cwd()
  let sources: string[] = []
  let resolvedConfig: any = {}

  let ready = reloadConfig()

  function registerConfigWatchers() {
    if (!sources.length) { return }
    const viteServer = getViteServer()
    viteServer.watcher.add(sources)
    viteServer.watcher.on('change', onConfigChange)
  }

  async function reloadConfig(newOptions: UserOptions = options): Promise<LoadConfigResult<PinceauTheme>> {
    const result = await loadConfig(newOptions || options)

    cwd = newOptions?.cwd ?? process.cwd()
    resolvedConfig = result.config
    sources = result.sources

    if (options?.configResolved) { options.configResolved(result.config) }

    if (dispatchConfigUpdate) { dispatchConfigUpdate(result) }

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

  async function onConfigChange(p: string) {
    if (!sources.includes(p)) { return }

    const viteServer = getViteServer()

    await reloadConfig()

    const ids = [
      '/__pinceau_css.css',
      '/__pinceau_ts.ts',
      '/__pinceau_js.js',
      '/__pinceau_flat_ts.ts',
      '/__pinceau_flat_js.js',
    ]

    // Use transformed files as well
    getTransformed().forEach(transformed => !ids.includes(transformed) && ids.push(transformed))

    const updates: Update[] = []

    const pushUpdate = (url, css = false) => {
      const update: Update = {
        type: 'js-update',
        path: url,
        acceptedPath: url,
        timestamp: +Date.now(),
      }

      updates.push(update)

      if (css) {
        updates.push({
          ...update,
          type: 'css-update',
        })
      }
    }

    // Loop on ids
    for (const id of ids) {
      const _module = viteServer.moduleGraph.getModuleById(id)
      if (!_module) { continue }
      viteServer.moduleGraph.invalidateModule(_module)
      pushUpdate(_module.url, id.endsWith('.css'))
    }

    viteServer.ws.send({
      type: 'update',
      updates,
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

  function resolveConfig<U extends PinceauTheme>(layer: ConfigLayer): ResolvedConfigLayer<U> {
    const empty = (path = undefined) => ({ path, config: {} as any })

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

    try {
      return loadConfigFile(filePath) as ResolvedConfigLayer<U>
    }
    catch (e) {
      message('CONFIG_RESOLVE_ERROR', [filePath, e])
      return empty(filePath)
    }
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
      result.config = merger(config, result.config) as U
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
