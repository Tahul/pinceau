import type { PinceauThemePaths } from '@pinceau/theme'
import type {
  CSS,
  FilterStartingWith,
  PinceauStyleFunctionContext,
  RawCSS,
  ThemeTokens,
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
  export type ResponsiveProp<T> = _ResponsiveProp<T>
  export type TokenProp<T extends string & ThemeTokens<PinceauThemePaths | (string & {})>> = _ResponsiveProp<FilterStartingWith<PinceauThemePaths, T>>
}
