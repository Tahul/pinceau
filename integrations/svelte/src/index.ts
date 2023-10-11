import 'svelte/elements'
import type { StyledFunctionArg } from '@pinceau/style'
import type { PinceauSvelteOptions } from './types'

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau JSX options.
     *
     * Using `true` will use default options for JSX transforms.
     *
     * Using `false` will completely disable JSX support.
     */
    svelte: Partial<PinceauSvelteOptions> | boolean
  }
}

declare module 'svelte/elements' {
  // eslint-disable-next-line unused-imports/no-unused-vars
  export interface DOMAttributes<T extends EventTarget> {
    styled?: StyledFunctionArg
  }
}

export * from './types'

export { version } from '../package.json'
