import chroma from 'chroma-js'
import type { ColorSchemeModes, DesignToken, TokensFunction } from '../types'
import { DARK, INITIAL, LIGHT, calcRegex, mqPlainRegex, referencesRegex, rgbaRegex } from './regexes'

/**
 * Resolve a css function property to a stringifiable declaration.
 */
export function resolveCssProperty(property: any, value: any, style: any, selectors: any, $tokens: TokensFunction, customProperties: any, colorSchemeMode: ColorSchemeModes) {
  // Resolve custom style directives
  const directive = resolveCustomDirectives(property, value, $tokens, colorSchemeMode)
  if (directive) { return directive }

  // Resolve custom properties
  if (customProperties[property]) {
    // Custom property is a function, pass value and return result
    if (typeof customProperties[property] === 'function') {
      return customProperties[property](value)
    }

    // Custom property is an object, if value is true, return result
    return value ? customProperties[property] : {}
  }

  // Resolve final value
  value = castValues(property, value, $tokens)

  // Return proper declaration
  return {
    [property]: value,
  }
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
 * Cast a value to a valid CSS unit.
 */
export function castValue(property: any, value: any, $tokens: TokensFunction) {
  if (typeof value === 'number') { return value }

  if (value.match(/rgb/g)) {
    value = resolveRgbaTokens(property, value, $tokens)
  }

  if (value.match(/calc/g)) {
    value = resolveCalcTokens(property, value, $tokens)
  }

  if (value.match(referencesRegex)) {
    value = resolveReferences(property, value, $tokens)
  }

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
 * Resolve rgba() value
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
          const token = $tokens(reference[1], { key: 'original' }) as DesignToken

          let tokenValue: any = token?.value || token

          if (!tokenValue) { return '0,0,0' }

          tokenValue = chroma(tokenValue).rgb()

          return `${tokenValue[0]},${tokenValue[1]},${tokenValue[2]}`
        },
      )

      return newValue
    },
  )

  return value
}

/**
 * Resolve calc() value
 */
export function resolveCalcTokens(property: string, value: string, $tokens: TokensFunction) {
  if (!(typeof value === 'string')) { return value }

  value = value.replace(
    calcRegex,
    (...parts) => {
      let newValue = parts[0]

      newValue = newValue.replace(
        referencesRegex,
        (...reference) => {
          const token = $tokens(reference[1], { key: 'original' }) as any

          return token?.value || token
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
export function resolveCustomDirectives(
  property: any,
  value: any,
  $tokens: TokensFunction,
  colorSchemesMode: ColorSchemeModes,
) {
  if (property.startsWith('@')) {
    const mqMatches = property.match(mqPlainRegex)

    const resolveColorScheme = (scheme: string) => {
      scheme = colorSchemesMode === 'class'
        ? `$.${scheme}`
        : `@media (prefers-color-scheme: ${scheme})`

      return {
        [scheme]: value,
      }
    }

    if (property === DARK) {
      return resolveColorScheme('dark')
    }

    if (property === LIGHT) {
      return resolveColorScheme('light')
    }

    if (property === INITIAL) {
      let token = $tokens('media.initial' as any, { key: 'value' })
      if (!token) {
        token = '(min-width: 0px)'
      }
      return {
        [`@media ${token}`]: value,
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
