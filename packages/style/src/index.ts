import type {
  CSS,
  PinceauStyleFunctionContext,
  RawCSS,
  ResponsiveProp as _ResponsiveProp,
} from './types'

export * from './types'

export { version } from '../package.json'

declare module '@pinceau/core' {
  interface PinceauTransformState {
    styleFunctions?: { [key: string]: PinceauStyleFunctionContext }
  }
}

declare global {
  export function css<T>(declaration: CSS<T, {}>): string
  export function styled(declaration: RawCSS): string
  export type StyleProp<T> = _ResponsiveProp<T>
}
