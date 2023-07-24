import type { ViteDevServer } from 'vite'
import type { ResolvedConfig } from './config'
import type { PinceauOptions, PinceauQuery, PinceauTheme, PinceauUtils, TokensFunction } from './'

/**
 * Complete Pinceau plugin context used at build time and in development.
 */
export interface PinceauContext extends
  PinceauVirtualContext,
  PinceauBuildContext,
  PinceauVirtualContext {
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
  transformed: { [key: string]: PinceauQuery | undefined }
  /**
   * Is a module transformable
   */
  isTransformable: (id: string) => PinceauQuery | undefined
  /**
   * Add a new transformed file if not already present.
   */
  addTransformed: (id: string, query?: PinceauQuery) => { [key: string]: PinceauQuery | undefined }
  /**
   * A list of transformed files
   */
  loaded: { [key: string]: PinceauQuery | undefined }
  /**
   * Is a module transformable
   */
  isLoadable: (id: string) => PinceauQuery | undefined
  /**
   * Add a new Loaded file if not already present.
   */
  addLoaded: (id: string, query?: PinceauQuery) => { [key: string]: PinceauQuery | undefined }
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

export interface PinceauConfigContext {
  /**
   * A list of watched sources
   */
  sources: string[]

  /**
   * Currently resolved configuration from the configuration loader.
   */
  resolvedConfig: ResolvedConfig

  /**
   * Is the loader currently loading configurations layers?
   */
  ready: Promise<ResolvedConfig>

  /**
   * Update the current rootDir
   */
  updateCwd: (newCwd: string) => Promise<ResolvedConfig>

  /**
   * Reload the configuration (with new options if provided)
   */
  reloadConfig: (newOptions?: PinceauOptions) => Promise<ResolvedConfig>

  /**
   * Registers the initial configurations watchers.
   */
  registerConfigWatchers: () => void
}

export interface PinceauVirtualContext {
  /**
   * Virtual outputs storage
   */
  outputs: VirtualOutputs
  /**
   * Register a new output in the virtual storage
   */
  registerOutput: (importPath: string, virtualPath: string, content: string) => void
  /**
   * Get an output by its id.
   */
  getOutput: (id: string) => any
  /**
   * Get an output id from its import path.
   */
  getOutputId: (id: string) => string | undefined
  /**
   * Update outputs in storage.
   */
  updateOutputs: (outputUpdate: VirtualOutputs) => any
}

/**
 * Virtual outputs storage model
 */
export type VirtualOutputs = { [key in string]: string }
