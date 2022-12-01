import chroma from 'chroma-js'
import type { DesignToken, PinceauContext } from '../types'
import { DARK, INITIAL, LIGHT, calcRegex, mqPlainRegex, referencesRegex, rgbaRegex } from './regexes'

/**
 * Resolve a css function property to a stringifiable declaration.
 */
export function resolveCssProperty(property: any, value: any, style: any, selectors: any, ctx: PinceauContext) {
  // Resolve custom style directives
  const directive = resolveCustomDirectives(property, value, ctx)
  if (directive) { return directive }

  // Resolve custom properties
  if (ctx.customProperties[property]) {
    // Custom property is a function, pass value and return result
    if (typeof ctx.customProperties[property] === 'function') {
      return ctx.customProperties[property](value)
    }

    // Custom property is an object, if value is true, return result
    return value ? ctx.customProperties[property] : {}
  }

  // Resolve final value
  value = castValues(property, value, ctx)

  // Return proper declaration
  return {
    [property]: value,
  }
}

/**
 * Cast value or values before pushing it to the style declaration
 */
export function castValues(property: any, value: any, ctx: PinceauContext) {
  if (Array.isArray(value) || typeof value === 'string' || typeof value === 'number') {
    if (Array.isArray(value)) {
      value = value.map(v => castValue(property, v, ctx)).join(',')
    }
    else {
      value = castValue(property, value, ctx)
    }
  }
  return value
}

/**
 * Cast a value to a valid CSS unit.
 */
export function castValue(property: any, value: any, ctx: PinceauContext) {
  if (typeof value === 'number') { return value }

  if (value.match(/rgb/g)) { value = resolveRgbaTokens(property, value, ctx) }

  if (value.match(/calc/g)) { value = resolveCalcTokens(property, value, ctx) }

  if (value.match(referencesRegex)) { value = resolveReferences(property, value, ctx) }

  if (value === '{}') { return '' }

  return value
}

/**
 * Resolve token references
 */
export function resolveReferences(_: string, value: string, ctx: PinceauContext) {
  if (!(typeof value === 'string')) { return value }

  value = value.replace(
    referencesRegex,
    (...parts) => {
      const [, tokenPath] = parts

      const token = ctx.$tokens(tokenPath, { key: undefined }) as DesignToken

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
export function resolveRgbaTokens(_: string, value: string, ctx: PinceauContext) {
  if (!(typeof value === 'string')) { return value }

  value = value.replace(
    rgbaRegex,
    (...parts) => {
      let newValue = parts[0]

      newValue = newValue.replace(
        referencesRegex,
        (...reference) => {
          const token = ctx.$tokens(reference[1], { key: 'original' }) as DesignToken

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
export function resolveCalcTokens(_: string, value: string, ctx: PinceauContext) {
  if (!(typeof value === 'string')) { return value }

  value = value.replace(
    calcRegex,
    (...parts) => {
      let newValue = parts[0]

      newValue = newValue.replace(
        referencesRegex,
        (...reference) => {
          const token = ctx.$tokens(reference[1], { key: 'original' }) as any
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
  ctx: PinceauContext,
) {
  if (property.startsWith('@')) {
    const mqMatches = property.match(mqPlainRegex)

    const resolveColorScheme = (scheme: string) => {
      scheme = ctx.options.colorSchemeMode === 'class'
        ? `$.${scheme}`
        : `@media (prefers-color-scheme: ${scheme})`

      return {
        [scheme]: value,
      }
    }

    if (property === DARK) { return resolveColorScheme('dark') }

    if (property === LIGHT) { return resolveColorScheme('light') }

    if (property === INITIAL) {
      let token = ctx.$tokens('media.initial' as any, { key: 'value' })
      if (!token) {
        token = '(min-width: 0px)'
      }
      return {
        [`@media ${token}`]: value,
      }
    }

    if (mqMatches) {
      const screen = mqMatches[0]?.replace?.('@', '')

      const screenToken = ctx.$tokens(`media.${screen}` as any, { key: 'value' })

      return screenToken
        ? {
            [`@media ${screenToken}`]: value,
          }
        : {
            [property]: value,
          }
    }
  }
}
