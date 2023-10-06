import type { PropType } from 'vue'
import type {
  ResponsiveProp as PinceauResponsiveProp,
  PropertyType,
  StyledFunctionArg,
  ThemeTokens,
} from '@pinceau/style'
import type { PinceauThemePaths } from '@pinceau/theme'
import type { PinceauVueOptions } from './types'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    styled?: StyledFunctionArg
  }
}

declare global {
  export type ResponsivePropType<T extends string | number | undefined> = PropType<PinceauResponsiveProp<T>>
  export type StyledProp = PropType<StyledFunctionArg>
  export type TokenPropType<T extends PropertyType & ThemeTokens<PinceauThemePaths | (string & {})>> = PropType<TokenProp<T>>
}

declare module '@pinceau/core' {
  interface PinceauPluginsOptions {
    /**
     * Pinceau Vue options.
     *
     * Using `true` will use default options for Vue transforms.
     *
     * Using `false` will completely disable Vue support.
     */
    vue: PinceauVueOptions | boolean
  }
}

export * from './types'
