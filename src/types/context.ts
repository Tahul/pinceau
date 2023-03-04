import type { ViteDevServer } from 'vite'
import type { PinceauVirtualContext } from '../theme/virtual'
import type { ResolvedConfig } from './config'
import type { PinceauOptions, PinceauTheme, TokensFunction } from './'

export interface PinceauBaseContext {
  /**
   * The current Pinceau environment setup.
   */
  env: 'prod' | 'dev'
  /**
   * Is this context running at runtime or build time?
   */
  runtime: boolean
}

export interface PinceauBuildContext extends PinceauBaseContext {
  /**
   * Pinceau user options passed from Vite plugin options or Nuxt config key.
   */
  options: PinceauOptions
  /**
   * Local reference to the Vite development server.
   */
  viteServer: ViteDevServer
  /**
   * A list of transformed files
   */
  transformed: string[]
  /**
   * Add a new transformed file if not already present.
   */
  addTransformed: (id: string) => void
  /**
   * The Pinceau theme object.
   */
  tokens: PinceauTheme
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

/**
 * Complete Pinceau plugin context used at build time and in development.
 */
export interface PinceauContext extends
  PinceauVirtualContext,
  PinceauBuildContext,
  PinceauConfigContext,
  PinceauVirtualContext {
  $tokens: TokensFunction
}

/**
 * Supported virtual outputs ids
 */
export type VirtualOutputsIds = 'css' | 'ts' | 'utils' | 'schema' | 'definitions'

/**
 * Virtual outputs storage model
 */
export type VirtualOutputs = { [key in VirtualOutputsIds]?: string }

/**
 * Supported Pinceau virtual import paths
 */
export type VirtualImportsPaths = 'pinceau.css' | '#pinceau/theme' | '#pinceau/utils' | '#pinceau/schema' | '#pinceau/definitions'

export type { PinceauVirtualContext }
