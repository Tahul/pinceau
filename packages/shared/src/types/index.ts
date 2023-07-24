import type { ColorSchemeModes } from './css'
import type { ConfigOrPaths, ResolvedConfig, ThemeGenerationOutput } from './config'

export * from './utils'
export * from './theme'
export * from './context'
export * from './css'
export * from './config'
export * from './runtime'
export * from './helper'
export * from './tokens'
export * from './map'
export * from './preset'
export * from './variants'
export * from './properties'
export * from './transforms'

export interface PinceauThemeOptions {
  /**
   * The path of your configuration file.
   */
  configLayers: ConfigOrPaths

  /**
   * The path of your configuration file.
   *
   * @default 'tokens.config'
   */
  configFileName: string

  /**
   * A callback called each time your config gets resolved.
   */
  configResolved: (config: ResolvedConfig) => void | Promise<void>

  /**
   * A callback called each time your config gets built.
   */
  configBuilt: (config: ThemeGenerationOutput) => void | Promise<void>

  /**
   * The directory in which you want to output the built version of your configuration.
   */
  buildDir: string

  /**
   * Imports the default CSS reset in the project.
   *
   * @default true
   */
  preflight: boolean | 'tailwind' | 'antfu' | 'eric-meyer' | 'normalize'

  /**
   * Toggle follow of symbolic links in glob.
   *
   * Disabling might be useful when testing.
   *
   * Enabling might be useful when using `link`.
   */
  followSymbolicLinks: boolean

  /**
   * Toggles color .{dark|light} global classes.
   *
   * If set to class, all @dark and @light clauses will also be generated
   * with .{dark|light} classes on <html> tag as a parent selector.
   *
   * @default 'class'
   */
  colorSchemeMode: ColorSchemeModes

  /**
   * Imports to append before the `utils.ts` declarations.
   *
   * These are usually the imports you make in your utils declaration files that Pinceau cannot automatically resolves.
   *
   * @example {[`import { MyThemeType } from "my-theme-types"`]}
   */
  utilsImports: string[]

  /**
   * Support for @nuxthq/studio module.
   */
  studio: boolean

  /**
   * Enables support for nuxt-component-meta.
   */
  componentMeta: boolean

  /**
   * Support for definitions.ts ; improving experience for Pinceau IntelliSense.
   */
  definitions: boolean
}

export interface PinceauRuntimeOptions {
  /* */
}

export interface PinceauStyleOptions {
  /**
   * Excluded transform paths.
   */
  excludes: string[]

  /**
   * Included transform paths.
   */
  includes: string[]
}

export interface PinceauVueOptions {
  /* */
}

/**
 * Options format used from implementation, normalized from PinceauUserOptions.
 */
export interface PinceauOptions {
  cwd: string

  dev: boolean

  debug: boolean | 2

  theme: PinceauThemeOptions

  style: PinceauStyleOptions

  runtime: PinceauRuntimeOptions

  vue: PinceauVueOptions
}

/**
 * Options format supplied by Pinceau users.
 */
export interface PinceauUserOptions {
  /**
   * The root directory of your project.
   *
   * @default process.cwd()
   */
  cwd?: string

  /**
   * Toggles the development mode of Pinceau.
   */
  dev?: boolean

  /**
   * Enables extra logging.
   */
  debug?: boolean | 2

  /**
   * Pinceau theming options.
   *
   * Using `true` will use default options for theming.
   *
   * Using `false` will completely disable theming.
   */
  theme?: Partial<PinceauThemeOptions> | boolean

  /**
   * Pinceau style options.
   *
   * Using `true` will use default options for style transforms.
   *
   * Using `false` will completely disable style transforms.
   */
  style?: Partial<PinceauStyleOptions> | boolean

  /**
   * Pinceau runtime options.
   *
   * Using `true` will use default options for runtime features.
   *
   * Using `false` will completely disable runtime features.
   */
  runtime?: Partial<PinceauRuntimeOptions> | boolean

  /**
   * Pinceau Vue options.
   *
   * Using `true` will use default options for Vue transforms.
   *
   * Using `false` will completely disable Vue support.
   */
  vue?: Partial<PinceauVueOptions> | boolean
}
