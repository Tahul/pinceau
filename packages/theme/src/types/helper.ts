import type { UnwrapKey } from '@pinceau/style'
import type { PinceauThemePaths } from './theme'
import type { DesignToken, DesignTokens } from './tokens'

/**
 * $theme function
 */
export type ThemeFunction = (
  token?: UnwrapKey<PinceauThemePaths, '$'> | (string & {})
) => DesignTokens | DesignToken | undefined
