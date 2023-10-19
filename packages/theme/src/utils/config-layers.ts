import type { PinceauContext, PinceauOptions } from '@pinceau/core'
import { merger } from '@pinceau/core/utils'
import { resolveSchema as resolveUntypedSchema } from 'untyped'
import type { PinceauTheme } from '@pinceau/outputs'
import type { ConfigLayer, ResolvedConfigLayer, Theme, ThemeLoadingOutput } from '../types'
import { resolveFileLayer } from './config-file'
import { normalizeTokens } from './tokens'
import { resolveMediaQueriesKeys } from './media-queries'
import { configSourceFromModulePath } from './module-path'

// Gives an empty layer for a given path or nothing.
export function getConfigLayer(path?: string): ResolvedConfigLayer {
  return {
    path: path || '',
    ext: '',
    content: '',
    theme: { media: {} },
    definitions: {},
    utils: {},
    imports: [],
  }
}

/**
 * Resolves all `layers` from Pinceau options and returns a LoadConfigResult object.
 */
export async function loadLayers(
  options: PinceauOptions,
  ctx: PinceauContext,
): Promise<ThemeLoadingOutput> {
  const sources = resolveConfigSources(options, ctx)

  /**
   * loadConfig result
   */
  const result: ThemeLoadingOutput = {
    sources: [] as string[],
    theme: {},
    utils: {},
    definitions: {},
    schema: {},
    imports: [],
  }

  /**
   * Loops through all sources and resolve result object from them.
   */
  for (const layer of sources) {
    // Support tokens passed in `layers: [{ tokens }]`
    let resolvedLayer: ResolvedConfigLayer
    if (layer.tokens || layer.utils) { resolvedLayer = resolveInlineLayer(layer, options) }

    else { resolvedLayer = await resolveFileLayer(layer, options) }

    if (!resolvedLayer) { continue }

    const { path, theme, definitions, utils, imports } = resolvedLayer

    // Push source
    if (path) { result.sources.push(path) }

    // Merge tokens
    if (Object.keys(theme).length) {
      const normalizedTheme = normalizeTokens(theme, resolveMediaQueriesKeys([theme, result.theme]))
      result.theme = merger(normalizedTheme, result.theme) as Theme<PinceauTheme>
    }

    // Overwrite same-name utils & definitions
    if (Object.keys(utils).length) { result.utils = Object.assign(result?.utils || {}, utils) }
    if (Object.keys(definitions).length) { result.definitions = Object.assign(result?.definitions || {}, definitions) }
    if (Object.keys(imports).length) { result.imports = [...new Set([...result?.imports, ...imports])] }
  }

  // Resolve schema if studio support is enabled
  if (options.theme.schema) { result.schema = await resolveUntypedSchema({ theme: result.theme }) }

  // Drop $schema keys now that it is resolved
  if (result.theme && Object.keys(result.theme).length) { result.theme = normalizeTokens(result.theme, resolveMediaQueriesKeys(result.theme), true) }

  return result
}

/**
 * Resolve a safe layers array from layers option.
 */
export function resolveConfigSources(
  options: PinceauOptions,
  ctx: PinceauContext,
) {
  // Inject palette if options set to true
  if (options.theme.palette) {
    const paletteSource = configSourceFromModulePath('@pinceau/palette', ctx)
    if (paletteSource) { options.theme.layers.push(paletteSource) }
  }

  let sources: ConfigLayer[] = options.theme.layers.reduce(
    (acc: ConfigLayer[], layerOrPath: string | ConfigLayer) => {
      let configLayer: ConfigLayer | undefined

      // Check if layer passed as-is
      if (typeof layerOrPath === 'object') {
        configLayer = layerOrPath
        if (configLayer.path && !configLayer.configFileName) { configLayer.configFileName = options.theme.configFileName }
      }

      // Check if the config layer path passed as string in the array
      if (typeof layerOrPath === 'string') {
        // Supports passing a package like `@pinceau/palette`
        if (!layerOrPath.startsWith('/')) {
          const resolvedModuleSource = configSourceFromModulePath(layerOrPath, ctx)
          if (resolvedModuleSource) { configLayer = resolvedModuleSource }
        }

        if (!configLayer) {
          configLayer = { path: layerOrPath, configFileName: options.theme.configFileName }
        }
      }

      // Only push configLayer in proper scenarios
      if (configLayer) {
        // File layer
        if (configLayer?.path && !acc.some(layer => layer.path === configLayer?.path)) { acc.unshift(configLayer) }
        // Inline layer
        else if (configLayer?.tokens || configLayer?.imports || configLayer?.utils) { acc.unshift(configLayer) }
      }

      return acc
    },
    [],
  )

  // Add CWD as a source if not already in layers
  if (options.cwd && !sources.some(source => source.path === options.cwd)) { sources.push({ path: options.cwd }) }

  // Dedupe sources
  sources = [...new Set(sources)]

  return sources
}

export function resolveInlineLayer(layer: ConfigLayer, _: PinceauOptions): ResolvedConfigLayer {
  const stringifiedUtils = Object
    .entries(layer?.utils || {})
    .reduce<{ [key: string]: { js: string; ts: string } }>(
      (acc, [key, utilFunction]) => {
        acc[key] = {
          js: `${utilFunction}`,
          ts: '',
        }
        return acc
      },
      {},
    )

  return {
    ext: '',
    path: '',
    content: '',
    theme: (layer?.tokens || {}) as Theme<PinceauTheme>,
    utils: stringifiedUtils,
    imports: layer?.imports || [],
    definitions: {},
  }
}
