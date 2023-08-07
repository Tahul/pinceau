import type { PinceauTheme, PinceauUtils, TokensFunction } from '@pinceau/theme'
import type { PinceauVirtualContext } from './virtual'
import type { PinceauOptions } from './options'
import type { PinceauQuery } from './query'
import type { PinceauTransformer } from './transforms'
import type { PinceauTransformState } from './transform-context'

/**
 * Complete Pinceau plugin context used at build time and in development.
 */
export interface PinceauContext extends
  PinceauVirtualContext,
  PinceauBuildContext {
  $tokens: TokensFunction
}

export interface PinceauBuildContext {
  /**
   * Pinceau user options passed from Vite plugin options or Nuxt config key.
   */
  options: PinceauOptions
  /**
   * A list of transformed files
   */
  transformed: { [key: string]: PinceauQuery & { state?: PinceauTransformState } }
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
  updateTheme: (tokens?: any) => PinceauTheme
  /**
   * Pinceau utils object.
   */
  utils: PinceauUtils
  /**
   * Update Pinceau utils properties.
   */
  updateUtils: (utils?: PinceauUtils) => PinceauUtils
  /**
   * Available custom transformers for SFC formats support.
   */
  transformers: { [key: string]: PinceauTransformer }
  /**
   * Registers a new custom transformer for SFC formats support.
   */
  registerTransformer: (id: string, fn: PinceauTransformer) => void
}
