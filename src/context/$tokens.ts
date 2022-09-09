import type { TokensFunction, TokensFunctionOptions } from '../types'
import { get } from '../utils'

/**
 * Get a theme token by its path
 */

export const createTokensHelper = (theme: any = {}, aliases: any = {}, defaultOptions: TokensFunctionOptions = {}): TokensFunction => {
  const defaultHelperOptions = Object.assign(
    defaultOptions,
    {
      key: 'attributes.variable',
      silent: false,
    },
  )

  const $tokens: TokensFunction = (path = undefined, options = defaultHelperOptions) => {
    const { key } = Object.assign(defaultHelperOptions, options)

    if (!path) { return theme }

    if (key === 'attributes.variable' && aliases[path]) {
      return aliases[path]
    }

    const token = get(theme, path)

    if (key) {
      const _value = get(token, key)
      if (_value) { return _value }
    }

    return token
  }

  return $tokens
}
