import defu from 'defu'
import type { TokensFunction, TokensFunctionOptions } from '../types'
import { get } from '../utils/data'

/**
 * Get a theme token by its path
 */

export const createTokensHelper = (theme: any = {}, aliases: any = {}, defaultOptions: TokensFunctionOptions = {}): TokensFunction => {
  const defaultHelperOptions: TokensFunctionOptions = defu(
    defaultOptions,
    {
      key: 'attributes.variable',
      silent: false,
      flattened: false,
    },
  )

  const $tokens: TokensFunction = (path = undefined, options: TokensFunctionOptions) => {
    const { key, flattened } = defu(options, defaultHelperOptions)

    if (!path) { return theme }

    if (key === 'attributes.variable' && aliases[path]) { return aliases[path] }

    const token = flattened ? theme[path] : get(theme, path)

    if (key) {
      const _value = get(token, key)
      if (_value) { return _value }
    }

    return token
  }

  return $tokens
}
