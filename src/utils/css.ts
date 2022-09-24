import { kebabCase } from 'scule'
import color from 'tinycolor2'
import type { DesignToken, TokensFunction } from '../types'
import { keyRegex, referencesRegex, rgbaRegex } from './regexes'

/**
 * Resolve a `var(--token)` value from a token path.
 */
export const resolveVariableFromPath = (path: string): string => `var(--${path.split('.').map((key: string) => kebabCase(key)).join('-')})`

/**
 * Take a property and transform every tokens present in it to their value.
 */
export const transformTokensToVariable = (property: string) => property.replace(keyRegex, (_, tokenPath) => resolveVariableFromPath(tokenPath))

/**
 * Cast a value to a valid CSS unit.
 */
export function castValue(property: any, value: any, $tokens: TokensFunction) {
  if (typeof value === 'number') { return value }

  value = resolveRgbaTokens(property, value, $tokens)

  value = resolveReferences(property, value, $tokens)

  if (value === '{}') { return '' }

  return value
}

/**
 * Cast value or values before pushing it to the style declaration
 */
export function castValues(property: any, value: any, $tokens: TokensFunction) {
  if (Array.isArray(value) || typeof value === 'string' || typeof value === 'number') {
    if (Array.isArray(value)) {
      value = value.map(v => castValue(property, v, $tokens)).join(',')
    }
    else {
      value = castValue(property, value, $tokens)
    }
  }
  return value
}

/**
 * Resolve token references
 */
export function resolveReferences(property: string, value: string, $tokens: TokensFunction) {
  value = value.replace(
    referencesRegex,
    (...parts) => {
      const [, tokenPath] = parts

      const token = $tokens(tokenPath, { key: undefined }) as DesignToken

      const tokenValue = token?.attributes?.variable || token?.value || token?.original?.value

      if (!tokenValue) { return '' }

      return tokenValue
    },
  )

  return value
}

/**
 * Resolve rgba() value properly
 */
export function resolveRgbaTokens(property: string, value: string, $tokens: TokensFunction) {
  value = value.replace(
    rgbaRegex,
    (...parts) => {
      let newValue = parts[0]

      newValue = newValue.replace(
        referencesRegex,
        (...reference) => {
          const [, referencePath] = reference

          const token = $tokens(referencePath, { key: undefined }) as DesignToken

          let tokenValue = token?.value || token?.original?.value

          if (!tokenValue) { return '0,0,0' }

          tokenValue = color(tokenValue).toRgb()

          return `${tokenValue.r},${tokenValue.g},${tokenValue.b}`
        },
      )

      return newValue
    },
  )

  return value
}

/**
 * Resolve custom directives (@screen, @dark).
 */
export function resolveCustomDirectives(property: any, value: any, $tokens: TokensFunction) {
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

      return {
        [`@media (min-width: ${tokenValue || '0px'})`]: value,
      }
    }
  }
}
