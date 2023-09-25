import type { PropType } from 'vue'
import type {
  ResponsiveProp as PinceauResponsiveProp,
  PropertyType,
  StyledFunctionArg,
  ThemeTokens,
} from '@pinceau/style'
import type { PinceauThemePaths } from '@pinceau/theme'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    styled?: StyledFunctionArg
  }
}

declare global {
  export type ResponsivePropType<T = PropertyType> = PropType<PinceauResponsiveProp<T>>
  export type StyledProp<T extends PropertyType = PropertyType> = PropType<StyledFunctionArg<T>>
  export type TokenPropType<T extends PropertyType & ThemeTokens<PinceauThemePaths | (string & {})>> = PropType<TokenProp<T>>
}

export * from './types'
