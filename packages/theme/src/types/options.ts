import type { PinceauContext } from '@pinceau/core'
import type { Named, Core as StyleDictionary, Transform } from 'style-dictionary-esm'
import type { FormatterArguments } from 'style-dictionary-esm/types/Format'
import type { ConfigOrPaths, ResolvedConfig, ThemeGenerationOutput, ThemeLoadingOutput } from './config'

/**
 * Theme output format for the theme builder.
 */
export interface PinceauThemeFormat {
  destination: string
  importPath: string
  virtualPath: string
  formatter: (args: FormatterArguments & { ctx: PinceauContext, instance: StyleDictionary, loadedTheme: ThemeLoadingOutput }) => string
}

export type PinceauThemeTokenTransform = Named<Transform>

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
  layers: ConfigOrPaths

  /**
   * The path of your configuration file.
   *
   * @default 'theme.config'
   */
  configFileName: string

  /**
   * The configuration file extensions Pinceau will search for in each layers.
   */
  configExtensions: string[]

  /**
   * A callback called each time your config gets resolved.
   */
  configResolved: ((config: ResolvedConfig) => void | Promise<void>)[]

  /**
   * A callback called each time your config gets built.
   */
  configBuilt: ((config: ThemeGenerationOutput) => void | Promise<void>)[]

  /**
   * Hook into StyleDictionary and Pinceau to add output formats for your theme.
   */
  outputFormats: PinceauThemeFormat[]

  /**
   * Hook into StyleDictionary to add transformations for your tokens.
   */
  tokensTransforms: PinceauThemeTokenTransform[]

  /**
   * The directory in which you want to output the built version of your configuration.
   *
   * If set to `false`, generation will not output anything on filesystem.
   */
  buildDir: string | undefined | false

  /**
   * Imports the default CSS reset in the project.
   *
   * @default true
   */
  preflight: boolean | 'normalize' | 'sanitize' | 'eric-meyer' | 'tailwind' | 'tailwind-compat'

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
   * Support for imports resolving from configuration files.
   */
  imports: boolean

  /**
   * Support for schema.ts output.
   */
  schema: boolean

  /**
   * Enables support for nuxt-component-meta.
   */
  componentMeta: boolean

  /**
   * Support for definitions.ts ; improving experience for Pinceau IntelliSense.
   */
  definitions: boolean

  /**
   * Inject `@pinceau/pigments` automatically
   */
  pigments: boolean

  /**
   * Toggles the tranformIndexHtml hook from the theme plugin.
   *
   * That can be useful when used in another context than a raw Vite project.
   */
  transformIndexHtml: boolean

  /**
   * Toggles the `<pinceau />` HTML tag transform.
   */
  pinceauHtmlTag: boolean

  /**
   * Toggles the HTML enforce mode.
   *
   * It is slower than `pinceauHtmlTag`, and will only be used as a fallback.
   */
  enforceHtmlInject: boolean

}
