import type { UnwrapKey } from '@pinceau/style'
import type { DesignToken, DesignTokens } from './tokens'
import type { GeneratedPinceauThemePaths as PinceauThemePaths } from '$pinceau/theme'

/**
 * $theme function
 */
export type ThemeFunction = (
  token?: UnwrapKey<PinceauThemePaths, '$'> | (string & {})
) => DesignTokens | DesignToken | undefined
