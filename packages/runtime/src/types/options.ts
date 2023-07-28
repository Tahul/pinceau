import type { ColorSchemeModes, TokensFunctionOptions } from '@pinceau/theme'

export interface PinceauRuntimePluginOptions {
  /**
   * Initial theme.
   *
   * It does not need to be passed as it will be resolved at runtime from the associated stylesheet.
   */
  theme?: any
  /**
   * Utils functions coming from `#pinceau/utils` import.
   */
  utils?: any
  /**
   * Toggles the multi-app mode.
   */
  multiApp: false
  /**
   * Toggles development mode for runtime plugin.
   */
  dev: boolean
  /**
   * Tokens resolver options.
   */
  tokensHelperConfig: TokensFunctionOptions
  /**
   * Color scheme mode to be used by runtime plugin.
   */
  colorSchemeMode: ColorSchemeModes
}
