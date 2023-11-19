import '@pinceau/core'
import type { PinceauVueOptions } from './types'

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau Vue options.
     *
     * Using `true` will use default options for Vue transforms.
     *
     * Using `false` will completely disable Vue support.
     */
    vue: PinceauVueOptions | boolean
  }
}

export * from './types'

export { version } from '../package.json'
