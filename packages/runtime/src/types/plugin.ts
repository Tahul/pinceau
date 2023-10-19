import type { ColorSchemeModes, Theme } from '@pinceau/theme'
import type { PinceauTheme, PinceauUtils } from '@pinceau/outputs'
import type { PinceauRuntimeOptions } from '.'

export interface PinceauRuntimePluginOptions extends Partial<PinceauRuntimeOptions> {
  /**
   * Inherit from Pinceau core options.
   *
   * Enables the runtime plugin debug mode.
   */
  dev?: boolean
  /**
   * Initial theme.
   *
   * It does not need to be passed as it will be resolved at runtime from the associated stylesheet.
   */
  theme?: Theme<PinceauTheme>
  /**
   * Utils functions coming from `@pinceau/outputs/utils` imports.
   */
  utils?: PinceauUtils
  /**
   * Color scheme mode to be used by runtime plugin.
   */
  colorSchemeMode?: ColorSchemeModes
}
