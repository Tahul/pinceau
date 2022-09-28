import { kebabCase } from 'scule'
import color from 'tinycolor2'
import type { DesignToken, TokensFunction } from '../types'
import { DARK, LIGHT, keyRegex, mqPlainRegex, referencesRegex, rgbaRegex } from './regexes'

/**
 * Resolve a css function property to a stringifiable declaration.
 */
export function resolveCssProperty(property: any, value: any, style: any, selectors: any, $tokens: TokensFunction) {
  // Resolve custom style directives
  const directive = resolveCustomDirectives(property, value, $tokens)
  if (directive) { return directive }

  // Resolve final value
  value = castValues(property, value, $tokens)

  // Return proper declaration
  return {
    [property]: value,
  }
}

/**
 * Resolve a `var(--token)` value from a token path.
 */
export const resolveVariableFromPath = (path: string): string => `var(--${path.split('.').map((key: string) => kebabCase(key)).join('-')})`

/**
 * Take a property and transform every tokens present in it to their value.
 */
export const transformTokensToVariable = (property: string) => (property || '').replace(keyRegex, (_, tokenPath) => resolveVariableFromPath(tokenPath))

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
 * Resolve token references
 */
export function resolveReferences(property: string, value: string, $tokens: TokensFunction) {
  if (!(typeof value === 'string')) { return value }

  value = value.replace(
    referencesRegex,
    (...parts) => {
      const [, tokenPath] = parts

      const token = $tokens(tokenPath, { key: undefined }) as DesignToken

      const tokenValue = typeof token === 'string' ? token : token?.attributes?.variable || token?.value || token?.original?.value

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
  if (!(typeof value === 'string')) { return value }

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
 * Resolve custom directives (@mq, @dark).
 */
export function resolveCustomDirectives(property: any, value: any, $tokens: TokensFunction) {
  if (property.startsWith('@')) {
    const mqMatches = property.match(mqPlainRegex)

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

    if (mqMatches) {
      const screen = mqMatches[1]
      const screenToken = $tokens(`media.${screen}` as any, { key: 'value' })

      return {
        [`@media ${screenToken}`]: value,
      }
    }
  }
}
