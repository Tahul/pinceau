import type { TokensFunction, TokensFunctionOptions } from '../types'
import { get } from '../utils'

/**
 * Get a theme token by its path
 */

export const createTokensHelper = (themeTokens: any = {}, tokensAliases: any = {}, defaultOptions: TokensFunctionOptions = {}): TokensFunction => {
  const defaultHelperOptions = Object.assign(
    defaultOptions,
    {
      key: 'attributes.variable',
      silent: false,
    },
  )

  const $tokens: TokensFunction = (path = undefined, options = defaultHelperOptions) => {
    const { key } = Object.assign(defaultHelperOptions, options)

    if (!path) { return themeTokens }

    if (key === 'attributes.variable' && tokensAliases[path]) {
      return tokensAliases[path]
    }

    const token = get(themeTokens, path)

    if (key) {
      const _value = get(token, key)
      if (_value) { return _value }
    }

    return token
  }

  return $tokens
}
