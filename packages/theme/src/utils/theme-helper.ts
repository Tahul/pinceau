import type { DesignToken, DesignTokens, ThemeFunction } from '@pinceau/theme'
import { get } from '@pinceau/core/runtime'
import type { PinceauTheme, PinceauThemePaths } from '@pinceau/outputs'

/**
 * Creates the $theme helper usable both at build or runtime.
 */
export function createThemeHelper(
  theme: any = {},
  options?: {
    cb?: (ctx: { query: string; token?: DesignTokens | DesignToken; theme: PinceauTheme }) => void
  },
): ThemeFunction {
  return (token?: PinceauThemePaths | (string & {})) => {
    const _theme = theme?.value || theme

    if (!_theme) { return }

    if (!token) { return _theme as DesignTokens }

    const _token: DesignTokens | DesignToken | undefined = get(_theme, token)

    if (options?.cb) { options.cb({ query: token, token: _token, theme: _theme }) }

    return _token
  }
}
