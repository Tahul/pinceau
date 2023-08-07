import type { PinceauCSSFunctionContext } from './types'

export * from './types'

export * from './ast'
export * from './eval'
export * from './css-function-context'

declare module '@pinceau/core' {
  interface PinceauTransformState {
    cssFunctions?: { [key: number]: PinceauCSSFunctionContext }
  }
}
