import type { PinceauCSSFunctionContext } from './types'

export * from './types'

export { version } from '../package.json'

declare module '@pinceau/core' {
  interface PinceauTransformState {
    cssFunctions?: PinceauCSSFunctionContext[]
  }
}
