import type { PinceauAstroOptions } from './types'

export * from './types'

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau Astro options.
     *
     * Using `true` will use default options for Astro transforms.
     *
     * Using `false` will completely disable Astro support.
     */
    astro?: PinceauAstroOptions | boolean
  }
}

export { version } from '../package.json'
