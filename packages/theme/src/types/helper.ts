import type { PinceauTokensPaths } from './theme'
import type { DesignToken, DesignTokens } from './tokens'

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
 * $dt function
 */
export type TokenHelperFunction = (
  path: PinceauTokensPaths | (string & object),
  key?: 'variable' | 'value'
) => string

/**
 * $tokens function
 */
export type TokensFunction = (token?: PinceauTokensPaths | (string & object)) => DesignTokens | DesignToken | undefined
