import type { PinceauConfigContext, Theme } from '@pinceau/theme'
import type { PinceauStyleFunctionContext } from '@pinceau/style'
import type { PinceauTheme, PinceauUtils } from '@pinceau/outputs'
import type { PinceauVirtualContext } from './virtual-context'
import type { PinceauOptions } from './options'
import type { PinceauQuery } from './query'
import type { PinceauTransformer } from './transforms'
import type { PinceauTransformState } from './transform-context'

export interface PinceauExtendedContext {
  [key: string]: any
}

/**
 * Complete Pinceau plugin context used at build time and in development.
 */
export interface PinceauContext extends
  PinceauVirtualContext,
  PinceauBuildContext,
  PinceauExtendedContext {
}

export interface PinceauBuildContext {
  /**
   * Any kind of dev server like ViteDevServer.
   */
  devServer: any
  /**
   * ConfigContext injected by @pinceau/theme when present.
   */
  configContext?: PinceauConfigContext
  /**
   * Pinceau user options passed from Vite plugin options or Nuxt config key.
   */
  options: PinceauOptions
  /**
   * A list of transformed files
   */
  transformed: { [key: string]: PinceauQuery & { state?: PinceauTransformState; previousState?: PinceauTransformState } }
  /**
   * Is a module transformable
   */
  isTransformable: (id: string) => PinceauQuery | void
  /**
   * Add a new transformed file if not already present.
   */
  addTransformed: (id: string, query: PinceauQuery) => { [key: string]: PinceauQuery }
  /**
   * The Pinceau theme theme object.
   */
  theme: PinceauTheme
  /**
   * Update the Pinceau theme reference.
   */
  updateTheme: (tokens?: Theme<PinceauTheme>) => PinceauTheme
  /**
   * Pinceau utils object.
   */
  utils: PinceauUtils
  /**
   * Update Pinceau utils properties.
   */
  updateUtils: (utils?: any) => PinceauUtils
  /**
   * Allows setting the theme function from a plugin.
   */
  setThemeFunction: (fn: any) => void
  /**
   * Available custom transformers for SFC formats support.
   */
  transformers: { [key: string]: PinceauTransformer }
  /**
   * Registers a new custom transformer for SFC formats support.
   */
  registerTransformer: (id: string, fn: PinceauTransformer) => void
  /**
   * Apply load transformers.
   */
  applyTransformers: (query: PinceauQuery, code: string) => string
  /**
   * Filters applied via `isTransformable` checking if a module query should pass through Pinceau transforms.
   */
  filters: PinceauFilterFunction[]
  /**
   * Add a module query filter.
   */
  registerFilter: (fn: PinceauFilterFunction) => void
  /**
   * Check if an id is a style function query.
   */
  isStyleFunctionQuery: (id: string) => PinceauQuery | void
  /**
   * Returns the context of a parsed style function from its id.
   */
  getStyleFunction: (id: string) => PinceauStyleFunctionContext | void

  /**
   * Push declarations inside `@pinceau/outputs/index.d.ts` format.
   */
  types: {
    imports: string []
    raw: string[]
    global: string[]
    exports: string[]
  }

  /**
   * Push new types in `@pinceau/types` format and merge them with previous ones.
   */
  addTypes: (types: Partial<PinceauBuildContext['types']>) => void

  /**
   * `fs` reference to avoid direct dependencies.
   */
  fs?: typeof import('node:fs')

  /**
   * `resolve` reference to avoid direct dependencies when using in browser.
   */
  resolve?: (path: string) => string | undefined
}

/**
 * PinceauQuery filter, if a filter returns `true` for a given query, the file won't be loaded through Pinceau.
 */
export type PinceauFilterFunction = (query: PinceauQuery) => boolean | void
