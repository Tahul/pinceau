import type { PinceauThemeOptions } from './types'

export * from './types'

export { version } from '../package.json'

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
