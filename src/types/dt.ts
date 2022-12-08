import type { PinceauTokensPaths } from './theme'
import type { DesignToken, PinceauTokens } from './tokens'

export interface TokensFunctionOptions {
  /**
   * The key that will be unwrapped from the design token object.
   * @default variable
   */
  key?: 'variable' | 'value' | string
  /**
   * Called on missing tokens.
   * @default false
   */
  onNotFound?: false | ((path: string, options: TokensFunctionOptions) => void)
  /**
   * The location of the resolved token.
   * Can be useful for logging purposes.
   * @default false
   */
  loc?: any
}

/**
 * $dt function typing
 */
export type DtFunction = (
  path: PinceauTokensPaths,
  options?: TokensFunctionOptions
) => string

export type TokensFunction = (
  path?: PinceauTokensPaths | (string & {}),
  options?: TokensFunctionOptions,
  theme?: any
) => PinceauTokens | DesignToken | number | string
