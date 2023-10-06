import type { PinceauRuntimeOptions } from './types'

export * from './utils'
export * from './types'

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau runtime options.
     *
     * Using `true` will use default options for runtime features.
     *
     * Using `false` will completely disable runtime features.
     */
    runtime: PinceauRuntimeOptions | boolean
  }
}
