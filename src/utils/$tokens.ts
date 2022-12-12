import type { TokensFunction, TokensFunctionOptions } from '../types'
import { get } from './data'

/**
 * Get a theme token by its path
 */

export const createTokensHelper = (theme: any = {}, options: TokensFunctionOptions = {}): TokensFunction => {
  const defaultHelperOptions: TokensFunctionOptions = Object.assign(
    {
      key: 'attributes.variable',
      onNotFound: false,
    },
    options,
  )

  const $tokens: TokensFunction = (path = undefined, options: TokensFunctionOptions) => {
    const $tokensOptions = Object.assign(defaultHelperOptions, options)

    const { key, onNotFound } = $tokensOptions

    if (!path) { return theme }

    const token = get(theme, path as string)

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

  return $tokens
}
