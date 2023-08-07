import type { ColorSchemeModes, TokensFunctionOptions } from '@pinceau/theme'

export interface PinceauRuntimePluginOptions {
  /**
   * Initial theme.
   *
   * It does not need to be passed as it will be resolved at runtime from the associated stylesheet.
   */
  theme?: any
  /**
   * Utils functions coming from `$pinceau/utils` imports.
   */
  utils?: any
  /**
   * Toggles the multi-app mode.
   */
  multiApp: false
  /**
   * Tokens resolver options.
   */
  tokensHelperConfig: TokensFunctionOptions
  /**
   * Color scheme mode to be used by runtime plugin.
   */
  colorSchemeMode: ColorSchemeModes
}
