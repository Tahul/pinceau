import type { PropType } from 'vue'
import type {
  CSSProperties as PinceauCSSProperties,
  ThemeTokens,
  ResponsiveProp as _ResponsiveProp,
} from '@pinceau/style'
import type { PinceauThemePaths } from '@pinceau/theme'

export * from './types'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    styled?: PinceauCSSProperties
  }
}

declare global {
  export type ResponsivePropType<T> = PropType<_ResponsiveProp<T>>
  export type TokenPropType<T extends string & ThemeTokens<PinceauThemePaths | (string & {})>> = PropType<TokenProp<T>>
}
