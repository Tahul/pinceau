import type { PinceauTheme } from './theme'
import type { ConfigOrPaths } from './context'
import type { ColorSchemeModes } from './css'

export * from './utils'
export * from './theme'
export * from './context'
export * from './css'
export * from './config'
export * from './runtime'

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
   * Included transform paths.
   */
  includes?: string[]
  /**
   * Toggle follow of symbolic links in glob.
   *
   * Disabling might be useful when testing.
   *
   * Enabling might be useful when using `link`.
   */
  followSymbolicLinks?: boolean
  /**
   * Toggles color .{dark|light} global classes.
   *
   * If set to class, all @dark and @light clauses will also be generated
   * with .{dark|light} classes on <html> tag as a parent selector.
   *
   * @default 'class'
   */
  colorSchemeMode?: ColorSchemeModes
  /**
   * Enables extra logging on transform failures.
   */
  debug?: boolean
}

export interface ModuleHooks {
  'pinceau:options': (options?: PinceauOptions) => Promise<void> | void
}

export interface ModuleOptions extends PinceauOptions {}
