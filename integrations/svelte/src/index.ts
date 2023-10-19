import type { PinceauSvelteOptions } from './types'

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau Svelte options.
     *
     * Using `true` will use default options for Svelte transforms.
     *
     * Using `false` will completely disable Svelte support.
     */
    svelte: PinceauSvelteOptions | boolean
  }
}

export * from './types'

export { version } from '../package.json'
