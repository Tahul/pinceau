import {
  PinceauStyleFunctionContext,
  CSSFunctionArg,
  StyledFunctionArg,
  ResponsiveProp as PinceauResponsiveProp,
  ThemeTokens,
  FilterStartingWith,
  PinceauStyleOptions
} from './types'

export * from './types'

declare module '@pinceau/core' {
  interface PinceauTransformState {
    styleFunctions?: { [key: string]: PinceauStyleFunctionContext }
  }
}

type Test = PinceauTheme

declare global {
  // css({ ... })
  export function css(declaration: CSSFunctionArg): string
  // styled({ ... }) & styled.a({ ... })
  export const styled: (<T extends object>(declaration: StyledFunctionArg<T>) => string)
  // Responsive prop, based on genearted `media` tokens
  export type ResponsiveProp<T extends string | number | undefined> = PinceauResponsiveProp<T>
  // Token prop, useful to create props scoped on a set of tokens like: `TokenProp<'$color'>` will allow all `$color.*.*` tokens.
  export type TokenProp<T extends ThemeTokens<PinceauThemePaths | (string & {})>> = PinceauResponsiveProp<FilterStartingWith<PinceauThemePaths, T>>
}

declare module '@pinceau/core' {
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
