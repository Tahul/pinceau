import type { ConfigOrPaths, ResolvedConfig, ThemeGenerationOutput } from './config'

export * from './helper'
export * from './config'
export * from './theme'
export * from './theme-map'
export * from './tokens'

/**
 * Supported color scheme modes.
 *
 * `media` will use `@media (prefers-color-scheme dark) { ... }`
 *
 * `class` will use `:root.dark { ... }`
 */
export type ColorSchemeModes = 'media' | 'class'

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
