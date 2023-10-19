import type { PinceauTheme } from '@pinceau/outputs'
import type { PinceauConfigContext, PinceauThemeOptions, Theme, ThemeFunction } from './types'

export * from './types'

export { version } from '../package.json'

export function defineTheme(config: Theme<PinceauTheme>) {
  return config
}

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau theming options.
     *
     * Using `true` will use default options for theming.
     *
     * Using `false` will completely disable theming.
     */
    theme: PinceauThemeOptions | boolean
  }

  interface PinceauExtendedContext {
    /**
     * $theme() function for build context.
     */
    $theme: ThemeFunction

    /**
     * ConfigContext injected by @pinceau/theme when present.
     */
    configContext?: PinceauConfigContext

    /**
     * The Pinceau theme theme object.
     */
    theme: PinceauTheme
  }
}
