import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import createJITI from 'jiti'
import { resolve } from 'pathe'
import type { ConfigFileImport, ConfigLayer, LoadConfigResult, PinceauOptions, PinceauTheme, ResolvedConfigLayer } from 'pinceau/types'
import { merger, message, normalizeConfig } from '../utils'
import { resolveDefinitions } from './definitions'

const extensions = ['.js', '.ts', '.mjs', '.cjs', '.json']

/**
 * Resolves all `configLayers` from Pinceau options and returns a LoadConfigResult object.
 */
export async function loadLayers<U extends PinceauTheme>(
  {
    cwd = process.cwd(),
    configLayers,
    configFileName = 'tokens.config',
    definitions = true,
  }: PinceauOptions,
): Promise<LoadConfigResult<U>> {
  const sources = resolveConfigSources({ cwd, configLayers, configFileName })

  /**
   * loadConfig result
   */
  const result: LoadConfigResult<U> = {
    config: {} as any,
    definitions: {} as any,
    sources: [] as string[],
  }

  /**
   * Loops through all sources and resolve result object from them.
   */
  for (const layer of sources) {
    const { path, config, definitions: resolvedDefinitions } = await resolveConfigLayer({ cwd, configFileName, definitions }, layer)

    if (path) { result.sources.push(path) }

    if (config) { result.config = merger(config, result.config) as U }

    if (definitions) { result.definitions = Object.assign(result?.definitions || {}, resolvedDefinitions) }
  }

  return result
}

/**
 * Resolve a config file content for the provided ConfigFileImport.
 */
export function resolveConfigFile(configFile: ConfigFileImport, definitions = true): ResolvedConfigLayer<any> {
  const { config, content, path } = configFile

  // Resolve media queries keys
  let mediaQueriesKeys = ['dark', 'light', 'initial']
  if (config.media && config.media.length) {
    mediaQueriesKeys = [...mediaQueriesKeys, ...Object.keys(config.media)]
  }

  // Cleanup configuration object
  const normalizedConfig = normalizeConfig(config, mediaQueriesKeys, false)

  // Try to resolve tokens definitions
  let resolvedDefinitions
  if (definitions) {
    try { resolvedDefinitions = resolveDefinitions(content, mediaQueriesKeys, path) }
    catch (e) { /* Mitigate definitions resolving errors */ }
  }

  return {
    path,
    content,
    definitions: resolvedDefinitions,
    config: normalizedConfig,
  }
}

/**
 * Resolves one layer of configuration.
 */
export async function resolveConfigLayer(
  {
    configFileName,
    cwd,
    definitions,
  }: PinceauOptions,
  layer: ConfigLayer,
): Promise<ResolvedConfigLayer> {
  const empty = (path = undefined) => ({ path, content: '', config: {} as any, schema: {}, definitions: {} })

  let path = ''

  // Resolve config path from layer
  if (typeof layer === 'string') { path = resolve(layer) }
  else if (typeof layer === 'object') { path = resolve(layer?.cwd || cwd, layer?.configFileName || configFileName) }
  else { return empty() }

  // Resolve filePath for that layer
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
    return resolveConfigFile(
      await importConfigFile({ path: filePath, ext }),
      definitions,
    )
  }
  catch (e) {
    message('CONFIG_RESOLVE_ERROR', [filePath, e])
    return empty(filePath)
  }
}

/**
 * Resolve a safe layers array from configLayers option.
 */
export function resolveConfigSources(
  {
    cwd = process.cwd(),
    configLayers,
    configFileName = 'tokens.config',
  }: PinceauOptions,
) {
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

  return sources
}

/**
 * Makes an import of a configuration file.
 */
export async function importConfigFile({ path, ext }): Promise<ConfigFileImport> {
  const content = await readFile(path, 'utf-8')

  // Read `.json` configurations
  if (ext === '.json') {
    const config = JSON.parse(content)
    return {
      path,
      content,
      config,
    }
  }

  // Import configuration with JITI
  const configImport = createJITI(path, {
    interopDefault: true,
    requireCache: false,
    esmResolve: true,
  })(path)

  return {
    path,
    content,
    config: configImport,
  }
}
