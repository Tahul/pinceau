import type { ViteDevServer } from 'vite'
import type { PinceauVirtualContext } from '../theme/virtual'
import type { PinceauTheme } from './theme'
import type { TokensFunction } from './dt'
import type { ConfigLayer, LoadConfigResult } from './config'
import type { DesignTokens, PinceauOptions } from './'

/**
 * Supports all the different ways of expressing configuration layers from `configOrPaths` from Pinceau's options.
 */
export type ConfigOrPaths = (string | PinceauTheme | ConfigLayer)[]

/**
 * 
 */
export interface PinceauContext<UserOptions extends PinceauOptions = PinceauOptions> extends PinceauConfigContext<UserOptions>, PinceauVirtualContext {
  env: 'prod' | 'dev'
  /**
   * Current 
   */
  tokens: DesignTokens
  utils: { [key: string]: any }
  $tokens: TokensFunction
  options: PinceauOptions
  transformed: string[]
  viteServer: ViteDevServer
  addTransformed: (id: string) => void
  setViteServer(server: ViteDevServer): void
}

export interface PinceauConfigContext<UserOptions = PinceauOptions> {
  /**
   * Current rootDir of Pinceau
   */
  cwd: string
  /**
   * A list of watched sources
   */
  sources: string[]
  /**
   * Currently resolved configuration from the configuration loader.
   */
  resolvedConfig: any
  /**
   * Is the loader currently loading configurations layers?
   */
  ready: Promise<LoadConfigResult<PinceauTheme>>
  /**
   * Update the current rootDir
   */
  updateCwd: (newCwd: string) => Promise<LoadConfigResult<PinceauTheme>>
  /**
   * Reload the configuration (with new options if provided)
   */
  reloadConfig: (newOptions?: UserOptions) => Promise<LoadConfigResult<PinceauTheme>>
  /**
   * Registers the initial configurations watchers.
   */
  registerConfigWatchers: () => void
}

export interface ThemeGenerationOutput {
  buildPath: string
  tokens: any
  outputs: Record<string, any>
}

export type { PinceauVirtualContext }
