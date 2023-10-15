import type { ResolvedConfig } from 'vite'
import type { PinceauBuildContext, PinceauContext, PinceauFilterFunction, PinceauOptions, PinceauQuery, PinceauTransformState, PinceauTransformer, PinceauUserOptions } from '../types'
import { parsePinceauQuery } from './query'
import { usePinceauVirtualContext } from './virtual-context'
import { isPathIncluded } from './filter'
import { normalizeOptions } from './options'
import type { PinceauUtils } from '$pinceau/utils'
import type { PinceauTheme } from '$pinceau/theme'

/**
 * Retrieves previously injected PinceauContext inside ViteDevServer to reuse context across plugins.
 */
export function getPinceauContext(config: ResolvedConfig): PinceauContext {
  const plugin = config.plugins.find(plugin => plugin && plugin.name === 'pinceau:core-plugin')

  const ctx = plugin?.api?.getPinceauContext()

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
   * Typings store for `$pinceau/types` output paths.
   *
   * This can be extended by plugins to add additional global or local typings.
   */
  const types: PinceauContext['types'] = {
    imports: [],
    global: [],
    raw: [],
  }

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
   * Theme function injected by @pinceau/theme hen present?
   */
  let themeFunction: undefined | (
    (
      theme: any,
      options?: {
        cb?: ((ctx: { query: string; token?: any; theme: PinceauTheme }) => void)
      }
    ) => any
  )

  /**
   * Build-time context.
   */
  const buildContext: PinceauBuildContext = {
    get options() { return options },

    /**
     * Child contexts
     */

    configContext: undefined,
    get devServer() { return devServer },

    /**
     * Transformers
     */

    transformers,
    registerTransformer(key: string, transformer: PinceauTransformer) { transformers[key] = transformer },
    applyTransformers(query: PinceauQuery, code: string) {
      // Find format transformer
      const transformer = transformers[query.ext]
      if (!transformer) { return code }

      // Apply load transformers
      if (transformer?.loadTransformers?.length) {
        for (const transform of transformer.loadTransformers) { code = transform(code, query, this as Partial<PinceauContext>) }
      }

      return code
    },

    /**
     * Configuration store
     */

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
    setThemeFunction(fn: any) {
      themeFunction = fn
    },

    /**
     * Typings store
     */

    get types() {
      return types
    },
    addTypes(newTypes) {
      Object.entries(newTypes).forEach(
        ([key, typings]) => {
          if (types[key]) { types[key] = Array.from(new Set([...types[key], ...typings])) }
        },
      )
    },

    /**
     * Transformed files store
     */

    get transformed() { return transformed },
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

    /**
     * Queries filters
     */

    get filters() { return filters },
    registerFilter(fn: PinceauFilterFunction) { filters.push(fn) },

    /**
     * Style functions store
     */

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
    ...buildContext,
    ...virtualContext,
    get $theme() {
      if (!themeFunction) { return }

      return themeFunction(
        theme,
        {
          cb(_ctx) {
            // if (!ctx?.token) { console.log('token not found!', ctx.query) }
          },
        },
      )
    },
  }
}
