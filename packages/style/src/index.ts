import type {
  PinceauStyleFunctionContext,
  PinceauStyleOptions,
} from './types'

export * from './types'

declare module '@pinceau/core' {
  interface PinceauTransformState {
    styleFunctions?: { [key: string]: PinceauStyleFunctionContext }
  }

  interface PinceauPluginsOptions {
    /**
     * Pinceau style options.
     *
     * Using `true` will use default options for style transforms.
     *
     * Using `false` will completely disable style transforms.
     */
    style: PinceauStyleOptions | boolean
  }
}

export { version } from '../package.json'
