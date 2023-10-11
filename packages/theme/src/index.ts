import type { PinceauThemeOptions, ThemeFunction } from './types'

export * from './types'

export { version } from '../package.json'

declare global {
  export const $theme: ThemeFunction
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
