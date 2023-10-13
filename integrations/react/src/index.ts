import type { PinceauReactOptions } from './types'

export { version } from '../package.json'

export * from './types'

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau React options.
     *
     * Using `true` will use default options for React transforms.
     *
     * Using `false` will completely disable React support.
     */
    react: Partial<PinceauReactOptions> | boolean
  }
}
