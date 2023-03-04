import { existsSync } from 'fs'
import { readFile } from 'fs/promises'
import { resolveSchema as resolveUntypedSchema } from 'untyped'
import createJITI from 'jiti'
import { resolve } from 'pathe'
import type { ConfigFileImport, ConfigLayer, PinceauOptions, PinceauTheme, ResolvedConfig, ResolvedConfigLayer } from '../types'
import { merger, message, normalizeTokens } from '../utils'
import { resolveDefinitions } from './definitions'

const extensions = ['.js', '.ts', '.mjs', '.cjs', '.json']

/**
 * Resolves all `configLayers` from Pinceau options and returns a LoadConfigResult object.
 */
export async function loadLayers(options: PinceauOptions): Promise<ResolvedConfig> {
  const { cwd, configLayers, configFileName } = options

  const sources = resolveConfigSources({ cwd, configLayers, configFileName })

  /**
   * loadConfig result
   */
  const result: ResolvedConfig = {
    tokens: {},
    utils: {},
    definitions: {},
    schema: {},
    sources: [] as string[],
  }

  /**
   * Loops through all sources and resolve result object from them.
   */
  for (const layer of sources) {
    // Support tokens passed in `configLayers: [{ tokens }]`
    if (layer.tokens) {
      const mediaQueriesKeys = resolveMediaQueriesKeys(result.tokens)
      result.tokens = merger(normalizeTokens(layer.tokens, mediaQueriesKeys), result.tokens)
      continue
    }

    const { path, tokens, definitions, utils } = await resolveConfigLayer(options, layer)

    // Push source
    if (path) { result.sources.push(path) }

    // Merge tokens
    if (tokens) { result.tokens = merger(tokens, result.tokens) }

    // Overwrite same-name utils & definitions
    if (utils) { result.definitions = Object.assign(result?.definitions || {}, utils) }
    if (definitions) { result.definitions = Object.assign(result?.definitions || {}, utils) }
  }

  // Resolve schema if studio support is enabled
  if (options.studio) { result.schema = await resolveUntypedSchema({ tokensConfig: result.tokens }) }

  return result
}

/**
 * Resolve a config file content for the provided ConfigFileImport.
 */
export function resolveConfigFile({ definitions }: PinceauOptions, configFile: ConfigFileImport): ResolvedConfigLayer {
  const { tokens, content, path } = configFile

  const mediaQueriesKeys = resolveMediaQueriesKeys(tokens)

  // Try to resolve tokens definitions
  let resolvedDefinitions
  if (definitions) {
    try { resolvedDefinitions = resolveDefinitions(content, mediaQueriesKeys, path) }
    catch (e) { /* Mitigate definitions resolving errors */ }
  }

  // Try to resolved the schema
  let resolvedUtils
  if (tokens.utils) {
    resolvedUtils = tokens.utils
    delete tokens.utils
  }

  return {
    tokens: normalizeTokens(tokens, mediaQueriesKeys, false),
    path,
    content,
    definitions: resolvedDefinitions,
    utils: resolvedUtils,
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
  const empty = (path = undefined): ResolvedConfigLayer => ({ path, content: '', tokens: {}, definitions: {}, utils: {} })

  // Resolve config path from layer
  let path = ''
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
      { definitions },
      await importConfigFile({ path: filePath, ext }),
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
    configLayers = [],
    configFileName = 'tokens.config',
  }: PinceauOptions,
) {
  let sources: ConfigLayer[] = configLayers.reduce(
    (acc: ConfigLayer[], layerOrPath: PinceauTheme | string | ConfigLayer) => {
      // Check if layer passed as-is
      if (typeof layerOrPath === 'object') {
        acc.push(layerOrPath as ConfigLayer)
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
  )

  // Add CWD as a source if not already in layers
  if (cwd && !sources.some(source => source.cwd === cwd)) {
    sources.unshift({
      cwd,
      configFileName,
    })
  }

  // Dedupe sources
  sources = [...new Set(sources)]

  return sources.reverse()
}

/**
 * Makes an import of a configuration file.
 */
export async function importConfigFile({ path, ext }): Promise<ConfigFileImport> {
  const content = await readFile(path, 'utf-8')

  // Read `.json` configurations
  if (ext === '.json') {
    return {
      path,
      content,
      tokens: JSON.parse(content),
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
    tokens: configImport,
  }
}

export function resolveMediaQueriesKeys(config: any) {
  // Resolve media queries keys
  let mediaQueriesKeys = ['dark', 'light', 'initial']
  if (config.media && config.media.length) { mediaQueriesKeys = [...mediaQueriesKeys, ...Object.keys(config.media)] }
  return mediaQueriesKeys
}
