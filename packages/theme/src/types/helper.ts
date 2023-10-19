import type { UnwrapKey } from '@pinceau/style'
import type { PinceauThemePaths } from '@pinceau/outputs'
import type { DesignToken, DesignTokens } from './tokens'

/**
 * $theme function
 */
export type ThemeFunction = (
  token?: UnwrapKey<PinceauThemePaths, '$'> | (string & {})
) => DesignTokens | DesignToken | undefined
