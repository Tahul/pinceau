import '@pinceau/core'
import type { PinceauReactOptions } from './types'

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau React options.
     *
     * Using `true` will use default options for React transforms.
     *
     * Using `false` will completely disable React support.
     */
    react: PinceauReactOptions | boolean
  }
}

export * from './types'

export { version } from '../package.json'
