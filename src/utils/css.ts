import chroma from 'chroma-js'
import type { DesignToken, PinceauContext } from '../types'
import { DARK, INITIAL, LIGHT, calcRegex, mqPlainRegex, referencesRegex, rgbaRegex } from './regexes'

export const nativeQueries = [
  // MDN
  'charset',
  'counter-style',
  'document',
  'font-face',
  'font-feature-values',
  'import',
  'keyframes',
  'layer',
  'media',
  'namespace',
  'page',
  'property',
  'supports',

  // Pinceau
  'dark',
  'light',
]

/**
 * Resolve a css function property to a stringifiable declaration.
 */
export function resolveCssProperty(
  property: any,
  value: any,
  style: any,
  selectors: any,
  ctx: PinceauContext,
  loc?: any,
) {
  // Resolve custom style directives
  const directive = resolveCustomDirectives(property, value, ctx, loc)
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
  value = castValues(property, value, ctx, loc)

  // Return proper declaration
  return {
    [property]: value,
  }
}

/**
 * Cast value or values before pushing it to the style declaration
 */
export function castValues(
  property: any,
  value: any,
  ctx: PinceauContext,
  loc?: any,
) {
  if (Array.isArray(value) || typeof value === 'string' || typeof value === 'number') {
    if (Array.isArray(value)) {
      value = value.map(v => castValue(property, v, ctx, loc)).join(',')
    }
    else {
      value = castValue(property, value, ctx, loc)
    }
  }
  return value
}

/**
 * Cast a value to a valid CSS unit.
 */
export function castValue(
  property: any,
  value: any,
  ctx: PinceauContext,
  loc?: any,
) {
  if (typeof value === 'number') { return value }

  if (value.match(/rgb/g)) { value = resolveRgbaTokens(property, value, ctx, loc) }

  if (value.match(/calc/g)) { value = resolveCalcTokens(property, value, ctx, loc) }

  if (value.match(referencesRegex)) { value = resolveReferences(property, value, ctx, loc) }

  if (value === '{}') { return '' }

  return value
}

/**
 * Resolve token references
 */
export function resolveReferences(
  _: string,
  value: string,
  ctx: PinceauContext,
  loc?: any,
) {
  if (!(typeof value === 'string')) { return value }

  value = value.replace(
    referencesRegex,
    (...parts) => {
      const [, tokenPath] = parts

      const token = ctx.$tokens(tokenPath, { key: undefined, loc }) as DesignToken

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
export function resolveRgbaTokens(
  _: string,
  value: string,
  ctx: PinceauContext,
  loc?: any,
) {
  if (!(typeof value === 'string')) { return value }

  value = value.replace(
    rgbaRegex,
    (...parts) => {
      let newValue = parts[0]

      newValue = newValue.replace(
        referencesRegex,
        (...reference) => {
          const token = ctx.$tokens(reference[1], { key: 'original', loc }) as DesignToken

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
export function resolveCalcTokens(
  _: string,
  value: string,
  ctx: PinceauContext,
  loc?: any,
) {
  if (!(typeof value === 'string')) { return value }

  value = value.replace(
    calcRegex,
    (...parts) => {
      let newValue = parts[0]

      newValue = newValue.replace(
        referencesRegex,
        (...reference) => {
          const token = ctx.$tokens(reference[1], { key: 'original', loc }) as any
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
  loc?: any,
) {
  if (property.startsWith('@')) {
    const mqMatches = property.match(mqPlainRegex)

    const resolveColorScheme = (scheme: string) => {
      scheme = ctx.options.colorSchemeMode === 'class'
        ? `html.${scheme} &`
        : `@media (prefers-color-scheme: ${scheme})`

      return {
        [scheme]: value,
      }
    }

    // @dark
    if (property === DARK) { return resolveColorScheme('dark') }

    // @light
    if (property === LIGHT) { return resolveColorScheme('light') }

    // @initial
    if (property === INITIAL) {
      let token = ctx.$tokens('media.initial' as any, { key: 'value', loc })
      if (!token) {
        token = '(min-width: 0px)'
      }
      return {
        [`@media ${token}`]: value,
      }
    }

    if (mqMatches) {
      const screen = mqMatches?.[0]?.replace?.('@', '')

      // Dismiss native `@` queries
      if (nativeQueries.includes(screen)) {
        return {
          [property]: value,
        }
      }

      const screenToken = ctx.$tokens(`media.${screen}` as any, { key: 'value', loc })

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
