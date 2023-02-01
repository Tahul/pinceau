import type { ConfigOrPaths, ThemeGenerationOutput } from './context'
import type { ColorSchemeModes } from './css'
import type { LoadConfigResult } from './config'

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
  configLayers?: ConfigOrPaths
  /**
   * The path of your configuration file.
   *
   * @default 'tokens.config'
   */
  configFileName?: string
  /**
   * A callback called each time your config gets resolved.
   */
  configResolved?: (config: LoadConfigResult) => void
  /**
   * A callback called each time your config gets built.
   */
  configBuilt?: (config: ThemeGenerationOutput) => void
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
  preflight?: boolean | 'tailwind' | 'antfu' | 'eric-meyer' | 'normalize'
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
  /**
   * Support for definitions.ts ; improving experience for Pinceau IntelliSense.
   */
  definitions?: boolean
  /**
   * Imports to append before the `utils.ts` declarations.
   *
   * These are usually the imports you make in your utils declaration files that Pinceau cannot automatically resolves.
   *
   * @example {[`import { MyThemeType } from "my-theme-types"`]}
   */
  utilsImports?: string[]
}
