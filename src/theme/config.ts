import { existsSync } from 'fs'
import fsp from 'node:fs/promises'
import { resolve } from 'pathe'
import jiti from 'jiti'
import type { ViteDevServer } from 'vite'
import { merger } from '../utils/merger'
import { message } from '../utils/logger'
import type { ConfigLayer, LoadConfigResult, PinceauConfigContext, PinceauOptions, PinceauTheme, ResolvedConfigLayer } from '../types'
import { outputFileNames } from '../utils/regexes'
import { resolveDefinitions } from './definitions'

const extensions = ['.js', '.ts', '.mjs', '.cjs', '.json']

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
    configLayers,
    configFileName = 'tokens.config',
    definitions = true,
  }: PinceauOptions,
): Promise<LoadConfigResult<U>> {
  let sources: ConfigLayer[] = [
    {
      cwd,
      configFileName,
    },
    ...(configLayers as any).reduce(
      (acc: ConfigLayer[], layerOrPath: PinceauTheme | string | ConfigLayer) => {
        // Check if layer passed as-is
        if (typeof layerOrPath === 'object' && ((layerOrPath as ConfigLayer)?.cwd || (layerOrPath as ConfigLayer)?.configFileName || (layerOrPath as ConfigLayer)?.tokens)) {
          acc.push(layerOrPath as ConfigLayer)
          return acc
        }

        // Check if tokens passed as straight object in the array
        if (typeof layerOrPath === 'object') {
          acc.push({ tokens: layerOrPath })
          return acc
        }

        // Check if the config layer path passed as string in the array
        if (typeof layerOrPath === 'string') {
          acc.push({
            cwd: layerOrPath,
            configFileName,
          })
          return acc
        }

        return acc
      },
      [],
    ),
  ].reverse()

  // Dedupe sources
  sources = [...new Set(sources)]

  async function resolveConfig<U extends PinceauTheme>(layer: ConfigLayer): Promise<ResolvedConfigLayer<U>> {
    const empty = (path = undefined) => ({ path, config: {} as any, schema: {}, definitions: {} })

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
    let ext
    extensions.some((_ext) => {
      if (existsSync(path + _ext)) {
        filePath = path + _ext
        ext = _ext
        return true
      }
      return false
    })

    if (!filePath) { return empty() }

    try {
      return await loadConfigFile({ path: filePath, ext, definitions }) as ResolvedConfigLayer<U>
    }
    catch (e) {
      message('CONFIG_RESOLVE_ERROR', [filePath, e])
      return empty(filePath)
    }
  }

  const result: LoadConfigResult<U> = {
    config: {} as any,
    definitions: {} as any,
    sources: [] as string[],
  }

  for (const layer of sources) {
    const { path, config, definitions } = await resolveConfig(layer)

    if (path) { result.sources.push(path) }

    if (config) { result.config = merger(config, result.config) as U }

    if (definitions) { result.definitions = Object.assign(result?.definitions || {}, definitions) }
  }

  return result
}

async function loadConfigFile({ path, ext, definitions }: { path: string; ext: string; definitions: boolean }) {
  const content = await fsp.readFile(path, 'utf-8')

  if (ext === '.json') {
    const config = JSON.parse(content)
    return {
      config,
      path,
    }
  }

  const configImport = jiti(path, {
    interopDefault: true,
    requireCache: false,
    esmResolve: true,
  })(path)

  let mediaQueriesKeys = ['dark', 'light', 'initial']
  if (configImport.media && configImport.media.length) {
    mediaQueriesKeys = [...mediaQueriesKeys, ...Object.keys(configImport.media)]
  }

  // Try to resolve tokens definitions
  let resolvedDefinitions = {}
  if (definitions) {
    try {
      resolvedDefinitions = resolveDefinitions(content, mediaQueriesKeys, path)
    }
    catch (e) {
      return
    }
  }

  return {
    definitions: resolvedDefinitions,
    content,
    config: configImport,
  }
}
