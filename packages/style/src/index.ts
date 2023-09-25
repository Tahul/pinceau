import type { PinceauThemePaths } from '@pinceau/theme'
import type {
  CSSFunctionArg,
  FilterStartingWith,
  ResponsiveProp as PinceauResponsiveProp,
  PinceauStyleFunctionContext,
  StyledFunctionArg,
  ThemeTokens,
} from './types'

export * from './types'

export { version } from '../package.json'

declare module '@pinceau/core' {
  interface PinceauTransformState {
    styleFunctions?: { [key: string]: PinceauStyleFunctionContext }
  }
}

declare global {
  export function css(declaration: CSSFunctionArg): string
  export function styled(declaration: StyledFunctionArg): string
  export type ResponsiveProp<T extends string | number | undefined> = PinceauResponsiveProp<T>
  export type TokenProp<T extends ThemeTokens<PinceauThemePaths | (string & {})>> = PinceauResponsiveProp<FilterStartingWith<PinceauThemePaths, T>>
}
