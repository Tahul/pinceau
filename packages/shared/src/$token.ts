import { get } from './data'
import { keyRegex } from './regexes'
import type { DesignToken, DesignTokens, TokensFunction, TokensFunctionOptions } from './types'
import type { GeneratedPinceauPaths } from '#pinceau/theme'

/**
 * Creates the $token helper usable both at build or runtime.
 */
export function createTokensHelper(_theme: any = {}, options: TokensFunctionOptions = {}): TokensFunction {
  const defaultHelperOptions: TokensFunctionOptions = {
    key: 'attributes.variable',
    onNotFound: false,
    ...options,
  }

  function $token(
    path?: GeneratedPinceauPaths | (string & {}),
    options?: TokensFunctionOptions,
    theme?: any,
  ): DesignTokens | DesignToken | number | string | undefined {
    if (!path) { return theme?.value || theme }

    const $tokensOptions = { ...defaultHelperOptions, ...options }

    const { key, onNotFound } = $tokensOptions

    const token = get(theme?.value || theme, path)

    if (!token && typeof onNotFound === 'function') {
      onNotFound(path, $tokensOptions)
      return
    }

    return key
      ? token
        ? token[key] ? token[key] : get(token, key)
        : token
      : token
  }

  return $token
}

/**
  * Take a CSS property and transform every tokens present in it to their value.
  */
export function transformTokensToVariable(property: string): string { return (property || '').replace(keyRegex, (_, tokenPath) => resolveVariableFromPath(tokenPath)) }

/**
 * Resolve a `var(--token)` value from a token path.
 */
export function resolveVariableFromPath(path: string): string { return `var(${pathToVarName(path)})` }

/**
 * Resolve a variable from a path.
 */
export function pathToVarName(path: string | string[]) {
  if (Array.isArray(path)) { path = path.join('-') }
  if (path.charAt(0) === '{' && path.charAt(path.length - 1) === '}') { path = path.substr(1, path.length - 2) }
  return `--${path.split('.').join('-')}`
}
