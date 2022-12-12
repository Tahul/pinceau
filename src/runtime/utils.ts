import { keyRegex } from '../utils/regexes'
import type { PinceauMediaQueries, PinceauTheme } from '../types'

// Local re-exports, avoiding whole bundle
export { resolveCssProperty } from '../utils/css'
export { stringify } from '../utils/stringify'
export { createTokensHelper } from '../utils/$tokens'

/**
 * Check if a string is a resolvable token path.
 */
export function isToken(token: any) { return typeof token === 'string' && keyRegex.test(token) }

/**
 * Handles a scale of tokens easily.
 */
export function scale(
  type: keyof PinceauTheme & (string & {}),
  prop: any,
  scales: ({ [key in PinceauMediaQueries]?: string }) | string,
  valueTransform?: (token) => string,
): ({ [key in PinceauMediaQueries]?: string }) | string {
  if (typeof prop === 'object') { return prop }

  if (typeof prop === 'string') {
    const to_ret: ({ [key in PinceauMediaQueries]?: string }) | string = {}

    // my-prop="{color.primary.500}"
    if (isToken(prop)) {
      to_ret.initial = prop as any
      return to_ret as any
    }

    // my-prop="red" & scales is a string (500)
    if (typeof scales === 'string') {
      to_ret.initial = `{${type}.${prop}.${scales}}` as any
    }

    // my-prop="red" & scales is an object ({ light: '500', dark: '600' })
    if (typeof scales === 'object') {
      Object.entries(scales).forEach(
        ([mqId, scaleValue]) => {
          if (typeof prop === 'string') {
            to_ret[mqId] = `{${type}.${prop}.${scaleValue}}` as any
          }
        },
      )
    }

    return valueTransform
      ? Object.entries(to_ret).reduce(
        (acc, [key, value]) => {
          acc[key] = valueTransform(value)
          return acc
        }, {})
      : to_ret
  }
}

export const utils = {
  isToken,
  scale,
}

