import type { PinceauTheme, PinceauThemePaths } from './theme'
import type { DesignToken, PinceauTokens } from './tokens'

export interface TokensFunctionOptions {
  /**
   * The key that will be unwrapped from the design token object.
   * @default variable
   */
  key?: string
  /**
   * Toggle logging if requesting an unknown token.
   * @default false
   */
  silent?: boolean
  /**
   * Makes the function compatible with flattened version of tokens file.
   */
  flattened?: boolean
}

export type DtFunction = (
  path: PinceauThemePaths
) => string

export type TokensFunction = (
  path?: PinceauThemePaths,
  options?: TokensFunctionOptions,
  theme?: PinceauTheme
) => PinceauTokens | DesignToken | number | string
