import type { Theme, ThemeFunction } from '@pinceau/theme'
import type { PinceauStyleFunctionContext } from '@pinceau/style'
import type { PinceauVirtualContext } from './virtual-context'
import type { PinceauOptions } from './options'
import type { PinceauQuery } from './query'
import type { PinceauTransformer } from './transforms'
import type { PinceauTransformState } from './transform-context'
import type { GeneratedPinceauTheme as PinceauTheme } from '$pinceau/theme'
import type { GeneratedPinceauUtils as PinceauUtils } from '$pinceau/utils'

/**
 * Complete Pinceau plugin context used at build time and in development.
 */
export interface PinceauContext extends
  PinceauVirtualContext,
  PinceauBuildContext {
  $theme: ThemeFunction
}

export interface PinceauBuildContext {
  /**
   * Any kind of dev server like ViteDevServer.
   */
  devServer: any
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
   *
   */
  getStyleFunction: (id: string) => PinceauStyleFunctionContext | void
}

/**
 * PinceauQuery filter, if a filter returns `true` for a given query, the file won't be loaded through Pinceau.
 */
export type PinceauFilterFunction = (query: PinceauQuery) => boolean | void
