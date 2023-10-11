import type {
  CSSFunctionArg,
  PinceauStyleFunctionContext,
  PinceauStyleOptions,
  ThemeTokens as PinceauThemeTokens,
  StyledFunctionArg,
} from './types'
import type { GeneratedPinceauThemePaths as PinceauThemePaths } from '$pinceau/theme'

export * from './types'

declare global {
  // css({ ... })
  export function css(declaration: CSSFunctionArg): string

  // styled({ ... }) & styled.a({ ... })
  export const styled: (<T extends {}>(declaration: StyledFunctionArg<T>) => string)

  // Theme tokens helper
  export type ThemeTokens<T extends PinceauThemePaths & (string & {}) = PinceauThemePaths & (string & {})> = PinceauThemeTokens<T>
}

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
