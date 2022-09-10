import json5 from 'json5'
import { referencesRegex, stringify } from '../utils'
import type { TokensFunction } from '../types'

const cssContentRegex = /css\(({.*?\})\)/mgs

const castValue = (_value: string | number, $tokens: TokensFunction): string | number => {
  if (typeof _value === 'number') {
    return _value
  }
  _value = _value.replace(
    referencesRegex,
    // @ts-expect-error - ?
    (...parts) => {
      const [, tokenPath] = parts

      const token = $tokens(tokenPath)

      return token
    },
  )
  if (_value === '{}') {
    return ''
  }
  return _value
}

const resolveValue = (value: string | string[] | number | number[], $tokens: TokensFunction): string | number | (string | number)[] => {
  if (Array.isArray(value)) {
    return value.map(v => castValue(v, $tokens)).join(',')
  }
  return castValue(value, $tokens)
}

export const transformCssFunction = (
  code = '',
  id: string,
  variantsProps: any = {},
  $tokens: TokensFunction,
) => {
  const resolveVariantProps = (property: string, value: any) => {
    variantsProps[property] = Object.entries(value).reduce(
      (acc: any, [key, _]) => {
        acc[key] = {
          type: Boolean,
          required: false,
          default: false,
        }
        return acc
      },
      {},
    )
  }

  code = code.replace(
    cssContentRegex,
    (...cssFunctionMatch) => {
      // Parse css({}) content
      let declaration = {}
      try {
        declaration = json5.parse(cssFunctionMatch[1])
      }
      catch (e) {
        //
      }

      const style = stringify(
        declaration,
        (property, value) => {
          // Match reserved directives (@screen, @dark, @light)
          if (property.startsWith('@')) {
            const DARK = '@dark'
            const LIGHT = '@light'
            const SCREEN = /@screen:(.*)/
            const screenMatches = property.match(SCREEN)
            if (property === DARK) {
              return {
                '@media (prefers-color-scheme: dark)': value,
              }
            }
            if (property === LIGHT) {
              return {
                '@media (prefers-color-scheme: light)': value,
              }
            }
            if (screenMatches) {
              const screenToken = $tokens(`screens.${screenMatches[1]}` as any, { key: undefined })
              return {
                [`@media (min-width: ${(screenToken as any).original.value})`]: value,
              }
            }
          }

          // Push variants to variantsProps
          if (value?.variants) {
            resolveVariantProps(property, value?.variants || {})
          }

          // Transform variants to nested selectors
          if (property === 'variants') {
            return Object.entries(value).reduce(
              (acc: any, [key, value]) => {
                acc[`&.${key}`] = value
                return acc
              },
              {},
            )
          }

          if (Array.isArray(value) || typeof value === 'string' || typeof value === 'number') {
            value = resolveValue(value, $tokens)
          }

          return {
            [property]: value,
          }
        },
      )

      return style
    },
  )

  return code
}
