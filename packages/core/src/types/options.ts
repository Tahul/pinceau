import type { PinceauThemeOptions } from '@pinceau/theme'
import type { PinceauStyleOptions } from '@pinceau/style'
import type { PinceauRuntimeOptions } from '@pinceau/runtime'
import type { PinceauVueOptions } from '@pinceau/vue'

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
