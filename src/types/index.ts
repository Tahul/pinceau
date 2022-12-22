import type { DtFunction } from './dt'
import type { ConfigOrPaths } from './context'
import type { ColorSchemeModes } from './css'

export * from './utils'
export * from './theme'
export * from './context'
export * from './css'
export * from './config'
export * from './runtime'
export * from './dt'
export * from './tokens'
export * from './map'
export * from './preset'
export * from './variants'
export * from './properties'

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
  configResolved?: (config: any) => void
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
   * Toggles the development mode of Pinceau.
   */
  dev?: boolean
  /**
   * Enables extra logging on transform failures.
   */
  debug?: boolean | 2
  /**
   * Enables support for nuxt-component-meta.
   */
  componentMetaSupport?: boolean
  /**
   * Completely enable or disable Pinceau runtime features.
   */
  runtime?: boolean
  /**
   * Support for @nuxthq/studio module.
   */
  studio?: boolean
}

export interface ModuleHooks {
  'pinceau:options': (options?: PinceauOptions) => Promise<void> | void
}

export interface ModuleOptions extends PinceauOptions {
}

declare global {
  const $dt: DtFunction
  const $pinceau: string
  const __$pProps: any
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dt: DtFunction
    $pinceau: string
  }
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'pinceau:options': ModuleHooks['pinceau:options']
  }
  interface NuxtConfig {
    pinceau?: ModuleOptions
  }
}
