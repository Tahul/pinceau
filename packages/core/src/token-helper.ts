import type { PinceauTheme, TokensFunction } from '@pinceau/theme'
import { get } from './data'

/**
 * Regex matching `{token.path}`
 */
export const keyRegex = /{(.*)}/g

/**
 * Creates the $token helper usable both at build or runtime.
 */
export function createTokensHelper(
  theme: any = {},
  options?: {
    cb?: (ctx: { query: string; token?: ReturnType<TokensFunction>; theme: PinceauTheme }) => void
  },
): TokensFunction {
  return (token) => {
    const _theme = theme?.value || theme

    if (!token || !_theme) { return _theme }

    const _token = get(_theme, token)

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
