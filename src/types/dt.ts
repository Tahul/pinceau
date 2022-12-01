import type { PinceauTokensPaths } from './theme'
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
  path: PinceauTokensPaths
) => string

export type TokensFunction = (
  path?: PinceauTokensPaths | (string & {}),
  options?: TokensFunctionOptions,
  theme?: any
) => PinceauTokens | DesignToken | number | string
