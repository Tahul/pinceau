import type { PinceauTheme, PinceauUtils, TokensFunction } from '@pinceau/theme'
import type { ViteDevServer } from 'vite'
import type { PinceauVirtualContext } from './virtual'
import type { PinceauOptions } from './options'
import type { PinceauQuery } from './query'

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
   * Local reference to the Vite development server.
   */
  viteServer: ViteDevServer
  /**
   * Updates the local ViteDevServer reference.
   */
  updateViteServer: (server: ViteDevServer) => ViteDevServer
  /**
   * A list of transformed files
   */
  transformed: { [key: string]: PinceauQuery }
  /**
   * Is a module transformable
   */
  isTransformable: (id: string) => PinceauQuery | void
  /**
   * Add a new transformed file if not already present.
   */
  addTransformed: (id: string, query: PinceauQuery) => { [key: string]: PinceauQuery }
  /**
   * A list of transformed files
   */
  loaded: { [key: string]: PinceauQuery }
  /**
   * Is a module transformable
   */
  isLoadable: (id: string) => PinceauQuery | void
  /**
   * Add a new Loaded file if not already present.
   */
  addLoaded: (id: string, query: PinceauQuery) => { [key: string]: PinceauQuery }
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
}
