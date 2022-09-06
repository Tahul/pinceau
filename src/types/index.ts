import type { PinceauTheme } from './theme'
import type { ConfigOrPaths } from './context'

export * from './utils'
export * from './theme'
export * from './context'
export * from './css'
export * from './config'

export interface PinceauOptions {
  /**
   * The root directory of your project.
   *
   * @default process.cwd()
   */
  cwd?: string
  /**
   * The path of your configuration file.
   */
  configOrPaths?: ConfigOrPaths
  /**
   * The path of your configuration file.
   *
   * @default 'pinceau.config'
   */
  configFileName?: string
  /**
   * A callback called each time your config gets resolved.
   */
  configResolved?: (config: PinceauTheme) => void
  /**
   * The directry in which you store your design tokens.
   *
   * @default 'tokens'
   */
  tokensDir?: string
  /**
   * The directory in which you want to output the built version of your configuration.
   */
  outputDir?: string
  /**
   * Imports the default CSS reset in the project.
   *
   * @default true
   */
  preflight?: boolean
  /**
   * Excluded transform paths.
   */
  excludes?: string[]
  /**
   * Included transform paths
   */
  includes?: string[]
}

export {}
