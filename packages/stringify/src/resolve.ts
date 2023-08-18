import type { PinceauContext } from '@pinceau/core'
import { pathToVarName, referencesRegex } from '@pinceau/core/runtime'
import type { StringifyContext } from './types'

const darkToken = '@dark'
const lightToken = '@light'
const initialToken = '@initial'

/**
 * Resolve a CSS function argument to a stringifiable declaration.
 */
export function resolveCssProperty(
  stringifyContext: StringifyContext,
  pinceauContext: PinceauContext,
) {
  let { property, value } = stringifyContext

  // Resolve custom style directives
  const directive = resolveCustomDirectives(stringifyContext, pinceauContext)
  if (directive) { return directive }

  // Resolve custom properties
  const utilProperty = resolveUtilsProperties(stringifyContext, pinceauContext)
  if (utilProperty) { return utilProperty }

  // Resolve final value
  value = resolveValue(value, pinceauContext)

  // Return proper declaration
  return {
    [property]: value,
  }
}

/**
 * Cast a value to a valid CSS unit.
 */
export function resolveValue(
  value: string | number | string[] | number[] | (string | number)[],
  pinceauContext: PinceauContext,
) {
  // Handle array values
  if (Array.isArray(value)) {
    value = value.map((v: string | number) => resolveValue(v, pinceauContext))
    return value
  }

  if (typeof value === 'string') { value = resolveReferences(value, pinceauContext) }
  if (typeof value === 'number') { value = `${value}px` }

  return value
}

/**
 * Resolve token references
 */
export function resolveReferences(
  value: string,
  pinceauContext: PinceauContext,
) {
  if (typeof value !== 'string') { return value }

  value = value.replace(referencesRegex, (_, tokenPath) => {
    const token = pinceauContext.$tokens(tokenPath)
    return (token?.variable ? token.variable : `var(${pathToVarName(tokenPath)})`) as string
  })

  return value
}

/**
 * Resolve custom directives (@mq, @dark).
 */
export function resolveCustomDirectives(
  { property, value }: StringifyContext,
  pinceauContext: PinceauContext,
) {
  const mode = pinceauContext?.options?.theme?.colorSchemeMode || 'media'

  if (property.startsWith('@')) {
    const resolveColorScheme = (scheme: string) => {
      scheme = mode === 'class'
        ? `:root.${scheme}`
        : `@media (prefers-color-scheme: ${scheme})`

      return {
        [scheme.startsWith('@media') ? scheme : `${scheme} &`]: value,
      }
    }

    // @dark
    if (property === darkToken) { return resolveColorScheme('dark') }

    // @light
    if (property === lightToken) { return resolveColorScheme('light') }

    // @initial
    if (property === initialToken) { return { '@media': value } }

    // Handle all user supplied @directives
    const mediaQueries = pinceauContext.$tokens('media' as any)
    if (mediaQueries) {
      const query = property.replace('@', '')
      if (mediaQueries[query]) {
        return {
          [`@media ${mediaQueries[query].value}`]: value,
        }
      }
    }

    return {
      [property]: value,
    }
  }
}

/**
 * Resolve utils properties coming from `utils` key of theme configuration.
 */
export function resolveUtilsProperties(
  { property, value }: StringifyContext,
  pinceauContext: PinceauContext,
) {
  const utils = pinceauContext?.utils

  if (utils?.[property]) {
    // @ts-ignore - Custom property is a function, pass value and return result
    if (typeof utils[property] === 'function') { return utils[property](value) }

    // Custom property is an object, if value is true, return result
    return value ? utils[property] : {}
  }
}
