import type { PinceauTokensPaths } from './theme'
import type { DesignToken, DesignTokens, TokenKey } from './tokens'

/**
 * $dt function
 */
export type TokenHelperFunction = (
  path: PinceauTokensPaths | (string & {}),
  key?: 'variable' | 'value'
) => string

/**
 * $tokens function
 */
export type TokensFunction = (
  token?: PinceauTokensPaths | (string & {})
) => { [key: string]: TokenKey | DesignTokens } | DesignToken | undefined
