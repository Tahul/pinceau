import type { DesignToken, DesignTokens, PinceauTheme, PinceauThemePaths, ThemeFunction } from '@pinceau/theme'
import { get } from './data'

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

/**
 * Resolve a variable from a path.
 */
export function pathToVarName(path: string | string[]) {
  if (Array.isArray(path)) { path = path.join('-') }
  if (path.charAt(0) === '{' && path.charAt(path.length - 1) === '}') { path = path.substring(1, path.length - 1) }
  return `--${path.split('.').join('-')}`
}
