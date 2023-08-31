import type { ColorSchemeModes, Theme } from '@pinceau/theme'

export interface PinceauRuntimePluginOptions {
  /**
   * Initial theme.
   *
   * It does not need to be passed as it will be resolved at runtime from the associated stylesheet.
   */
  theme?: Theme<PinceauTheme>
  /**
   * Utils functions coming from `$pinceau/utils` imports.
   */
  utils?: PinceauUtils
  /**
   * App id used to identify this app if multiple Pinceau instances runs at the same time.
   *
   * Setting it to a string enables the multi-app feature.
   */
  appId?: string
  /**
   * Color scheme mode to be used by runtime plugin.
   */
  colorSchemeMode?: ColorSchemeModes
}
