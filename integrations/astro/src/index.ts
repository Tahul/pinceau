import type { PinceauPluginsOptions } from '@pinceau/core'
import type { PinceauAstroOptions } from './types'

export * from './types'

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau JSX options.
     *
     * Using `true` will use default options for JSX transforms.
     *
     * Using `false` will completely disable JSX support.
     */
    astro?: PinceauAstroOptions | boolean
  }
}

export { version } from '../package.json'
