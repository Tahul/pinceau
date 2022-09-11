import json5 from 'json5'
import chalk from 'chalk'
import { cssContentRegex, logger, resolveReferences, resolveRgbaTokens, stringify } from '../utils'
import type { TokensFunction } from '../types'

const castValue = (key: string, value: string | number, $tokens: TokensFunction): string | number => {
  if (typeof value === 'number') {
    return value
  }

  value = resolveRgbaTokens(key, value, $tokens)

  value = resolveReferences(key, value, $tokens)

  if (value === '{}') { return '' }

  return value
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
              const screen = screenMatches[1]
              const screenToken = $tokens(`screens.${screen}` as any, { key: undefined })
              const tokenValue = (screenToken as any)?.original?.value

              if (!tokenValue) {
                logger.warn(`This screen size is not defined: ${chalk.red(screen)}\n`)
              }

              return {
                [`@media (min-width: ${tokenValue || '0px'})`]: value,
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

          // Resolve final value
          if (Array.isArray(value) || typeof value === 'string' || typeof value === 'number') {
            if (Array.isArray(value)) {
              value = value.map(v => castValue(property, v, $tokens)).join(',')
            }
            else {
              value = castValue(property, value, $tokens)
            }
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
