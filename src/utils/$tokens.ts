import { unref } from 'vue'
import type { TokensFunction, TokensFunctionOptions } from '../types'
import { get } from './data'
import { keyRegex } from './regexes'

/**
 * Get a theme token by its path
 */
export function createTokensHelper(theme: any = {}, options: TokensFunctionOptions = {}): TokensFunction {
  const defaultHelperOptions: TokensFunctionOptions = {
    key: 'attributes.variable',
    onNotFound: false,
    ...options,
  }

  function $tokens(path = undefined, options: TokensFunctionOptions) {
    if (!path) { return unref(theme) }

    const $tokensOptions = { ...defaultHelperOptions, ...options }

    const { key, onNotFound } = $tokensOptions

    const token = get(unref(theme), path)

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

  return $tokens.bind(this)
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
