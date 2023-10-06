import type { ResolvedConfig } from 'vite'
import type { PinceauTheme, PinceauUtils } from '@pinceau/theme'
import type { PinceauBuildContext, PinceauContext, PinceauFilterFunction, PinceauOptions, PinceauQuery, PinceauTransformState, PinceauTransformer, PinceauUserOptions } from '../types'
import { parsePinceauQuery } from './query'
import { usePinceauVirtualContext } from './virtual-context'
import { createThemeHelper } from './theme-helper'
import { isPathIncluded } from './filter'
import { normalizeOptions } from './options'

/**
 * Retrieves previously injected PinceauContext inside ViteDevServer to reuse context across plugins.
 */
export function getPinceauContext(config: ResolvedConfig) {
  if (!config.plugins) { return }

  const plugin = config.plugins.find(plugin => plugin && plugin.name === 'pinceau:core-plugin')

  if (!plugin) { return }

  const ctx = plugin.api.getPinceauContext()

  if (ctx) { return ctx }

  throw new Error('You tried to use a Pinceau plugin without previously injecting the @pinceau/core plugin.')
}

/**
 * Creates the Pinceau context from the options.
 */
export function usePinceauContext(userOptions?: PinceauUserOptions): PinceauContext {
  /**
   * Virtual storage context.
   */
  const virtualContext = usePinceauVirtualContext()

  /**
   * Normalize user options.
   */
  const options: PinceauOptions = normalizeOptions(userOptions || {})

  /**
   * Available custom parsers for SFC formats support.
   */
  const transformers: { [key: string]: PinceauTransformer } = {}

  /**
   * Track list of module queries that got through any kind of Pinceau transforms.
   */
  const transformed: { [key: string]: PinceauQuery & { state?: PinceauTransformState; previousState?: PinceauTransformState } } = {}

  /**
   * Filters applied via `isTransformable` checking if a module query should pass through Pinceau transforms.
   */
  const filters: PinceauFilterFunction[] = []

  /**
   * Current dev server.
   */
  let devServer: any

  /**
   * Current reference of built theme.
   */
  let theme: PinceauTheme

  /**
   * Current reference of built utils properties.
   */
  let utils: PinceauUtils

  /**
   * Build-time context.
   */
  const buildContext: PinceauBuildContext = {
    get devServer() { return devServer },
    transformers,
    registerTransformer(key: string, transformer: PinceauTransformer) { transformers[key] = transformer },
    applyTransformers(query: PinceauQuery, code: string) {
      // Find format transformer
      const transformer = transformers[query.ext]
      if (!transformer) { return code }

      // Apply load transformers
      if (transformer?.loadTransformers?.length) {
        for (const transform of transformer.loadTransformers) {
          code = transform(code, query, this as Partial<PinceauContext>)
        }
      }

      return code
    },
    get options() { return options },
    get theme() { return theme },
    updateTheme(_theme: any) {
      if (_theme) { theme = _theme }
      return theme
    },
    get utils() { return utils },
    updateUtils(_utils) {
      if (_utils) { utils = _utils }
      return utils
    },
    get transformed() { return transformed },
    get filters() { return filters },
    registerFilter(fn: PinceauFilterFunction) { filters.push(fn) },
    isTransformable(id: string): PinceauQuery | void {
      // Skip excluded paths
      if (!isPathIncluded(id, options)) { return }

      const query = parsePinceauQuery(id)

      if (query.filename === id && transformed?.[id]?.state) {
        transformed[id].previousState = transformed[id].state
        transformed[id].state = {}
      }

      if (this.filters.length) {
        return this.filters.some(filter => !filter(query))
          ? query
          : undefined
      }

      return query
    },
    addTransformed: (id: string, query?: PinceauQuery) => {
      if (!transformed[id] && query) { transformed[id] = query }
      return transformed
    },
    isStyleFunctionQuery: (id: string) => {
      if (!id.startsWith('$pinceau/style-functions')) { return }
      return parsePinceauQuery(id)
    },
    getStyleFunction: (id: string) => {
      const query = parsePinceauQuery(id)
      if (!query.src || !query.styleFunction || !transformed[query.src]) { return }
      return transformed[query.src].state?.styleFunctions?.[query.styleFunction]
    },
  }

  return {
    /**
     * Main build-time $theme helper.
     */
    get $theme() {
      return createThemeHelper(
        theme,
        {
          cb(ctx) {
            if (!ctx?.token) { console.log('token not found!', ctx.query) }
          },
        },
      )
    },
    ...buildContext,
    ...virtualContext,
  }
}
