import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolveSchema as resolveUntypedSchema } from 'untyped'
import createJITI from 'jiti'
import { resolve } from 'pathe'
import type { PinceauOptions } from '@pinceau/core'
import { merger, message } from '@pinceau/core'
import type { ConfigFileImport, ConfigLayer, PinceauTheme, ResolvedConfig, ResolvedConfigLayer } from './types'
import { normalizeTokens } from './tokens'
import { resolveDefinitions } from './definitions'

const extensions = ['.js', '.ts', '.mjs', '.cjs', '.json']

/**
 * Resolves all `configLayers` from Pinceau options and returns a LoadConfigResult object.
 */
export async function loadLayers(options: PinceauOptions): Promise<ResolvedConfig> {
  const sources = resolveConfigSources(options)

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
  if (options.theme.studio) { result.schema = await resolveUntypedSchema({ tokensConfig: result.tokens }) }

  return result
}

/**
 * Resolve a config file content for the provided ConfigFileImport.
 */
export function resolveConfigFile(
  options: PinceauOptions,
  configFile: ConfigFileImport,
): ResolvedConfigLayer {
  const { tokens, content, path } = configFile

  const mediaQueriesKeys = resolveMediaQueriesKeys(tokens)

  // Try to resolve tokens definitions
  let definitions
  if (options.theme.definitions) {
    try { definitions = resolveDefinitions(content, mediaQueriesKeys, path) }
    catch (e) { /* Mitigate definitions resolving errors */ }
  }

  // Try to resolved the schema
  let utils
  if (tokens.utils) {
    utils = { ...tokens.utils }
    delete tokens.utils
  }

  return {
    tokens: normalizeTokens(tokens, mediaQueriesKeys, false),
    path,
    content,
    definitions,
    utils,
  }
}

/**
 * Resolves one layer of configuration.
 */
export async function resolveConfigLayer(
  options: PinceauOptions,
  layer: ConfigLayer,
): Promise<ResolvedConfigLayer> {
  const empty = (path?: string): ResolvedConfigLayer => ({ path: path || '', content: '', tokens: {}, definitions: {}, utils: {} })

  // Resolve config path from layer
  let path = ''
  if (typeof layer === 'string') { path = resolve(layer) }
  else if (typeof layer === 'object') { path = resolve(layer?.cwd || options.cwd || '', layer?.configFileName || options.theme.configFileName || '') }
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
    return resolveConfigFile(options, await importConfigFile({ path: filePath, ext }))
  }
  catch (e) {
    message('CONFIG_RESOLVE_ERROR', [filePath, e])
    return empty(filePath)
  }
}

/**
 * Resolve a safe layers array from configLayers option.
 */
export function resolveConfigSources(options: PinceauOptions) {
  let sources: ConfigLayer[] = options.theme.configLayers.reduce(
    (acc: ConfigLayer[], layerOrPath: PinceauTheme | string | ConfigLayer) => {
      // Check if layer passed as-is
      if (typeof layerOrPath === 'object') {
        acc.unshift(layerOrPath as ConfigLayer)
        return acc
      }

      // Check if the config layer path passed as string in the array
      if (typeof layerOrPath === 'string') {
        acc.unshift({
          cwd: layerOrPath,
          configFileName: options.theme.configFileName,
        })
        return acc
      }

      return acc
    },
    [],
  )

  // Add CWD as a source if not already in layers
  if (options.cwd && !sources.some(source => source.cwd === options.cwd)) {
    sources.push({
      cwd: options.cwd,
      configFileName: options.theme.configFileName,
    })
  }

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
