import type { PinceauThemeOptions, ThemeFunction } from './types'
import type { GeneratedPinceauMediaQueries, GeneratedPinceauTheme, GeneratedPinceauThemePaths } from '$pinceau/theme'
import type { GeneratedPinceauUtils } from '$pinceau/utils'

export * from './types'

export { version } from '../package.json'

declare global {
  export const $theme: ThemeFunction
  export type PinceauTheme = GeneratedPinceauTheme
  export type PinceauThemePaths = GeneratedPinceauThemePaths
  export type PinceauMediaQueries = GeneratedPinceauMediaQueries
  export type PinceauUtils = GeneratedPinceauUtils
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
}
