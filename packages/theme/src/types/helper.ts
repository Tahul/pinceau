import type { PinceauThemePaths } from './theme'
import type { DesignToken, DesignTokens } from './tokens'

/**
 * $theme function
 */
export type ThemeFunction = (
  token?: PinceauThemePaths | (string & {})
) => DesignTokens | DesignToken | undefined
