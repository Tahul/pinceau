import type { TokensFunction, TokensFunctionOptions } from '../types'
import { get } from './data'

/**
 * Get a theme token by its path
 */

export const createTokensHelper = (theme: any = {}, options: TokensFunctionOptions = {}): TokensFunction => {
  const defaultHelperOptions: TokensFunctionOptions = Object.assign(
    {
      key: 'attributes.variable',
      silent: false,
      flattened: false,
    },
    options,
  )

  const $tokens: TokensFunction = (path = undefined, options: TokensFunctionOptions) => {
    const { key, flattened } = Object.assign(defaultHelperOptions, options)

    if (!path) { return theme }

    const token = flattened ? theme[path as string] : get(theme, path as string)

    if (key) {
      const _value = get(token, key)
      if (_value) { return _value }
    }

    return token
  }

  return $tokens
}
