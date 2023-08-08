import type { PinceauTokensPaths } from './theme'
import type { DesignToken, DesignTokens } from './tokens'

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
