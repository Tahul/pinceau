import type { ColorSchemeModes, DesignToken, DesignTokens, PinceauContext, PinceauMediaQueries, PinceauOptions, PinceauTransformContext, RawTokenType, StringifyContext, TokensFunction } from './types'
import { pathToVarName } from './$token'
import { DARK, INITIAL, LIGHT, referencesRegex } from './regexes'

/**
 * Resolve a css function property to a stringifiable declaration.
 */
export function resolveCssProperty(
  stringifyContext: StringifyContext,
  transformContext: Partial<PinceauTransformContext>,
  pinceauContext: Partial<PinceauContext> & { $tokens: TokensFunction; options: PinceauOptions },
) {
  let { property, value } = stringifyContext

  // Resolve custom style directives
  const directive = resolveCustomDirectives(stringifyContext, transformContext, pinceauContext)
  if (directive) { return directive }

  // Resolve custom properties
  const utils = pinceauContext?.resolvedConfig?.utils
  if (utils?.[property]) {
    // @ts-ignore - Custom property is a function, pass value and return result
    if (typeof utils[property] === 'function') { return utils[property](value) }

    // Custom property is an object, if value is true, return result
    return value ? utils[property] : {}
  }

  // Resolve final value
  value = castValues(stringifyContext, transformContext, pinceauContext)

  // Return proper declaration
  return {
    [property]: value,
  }
}

/**
 * Cast value or values before pushing it to the style declaration
 */
export function castValues(
  stringifyContext: StringifyContext,
  transformContext: Partial<PinceauTransformContext>,
  pinceauContext: Partial<PinceauContext> & { $tokens: TokensFunction },
) {
  let { value } = stringifyContext
  if (Array.isArray(value) || typeof value === 'string' || typeof value === 'number') {
    if (Array.isArray(value)) { value = value.map(v => castValue({ ...stringifyContext, value: v }, transformContext, pinceauContext)).join(',') }
    else { value = castValue(stringifyContext, transformContext, pinceauContext) }
  }
  return value
}

/**
 * Cast a value to a valid CSS unit.
 */
export function castValue(
  stringifyContext: StringifyContext,
  transformContext: Partial<PinceauTransformContext>,
  pinceauContext: Partial<PinceauContext> & { $tokens: TokensFunction },
) {
  let { value } = stringifyContext
  if (typeof value === 'number') { return value }
  if (value.match(referencesRegex)) { value = resolveReferences(stringifyContext, transformContext, pinceauContext) }
  if (value === '{}') { return '' }
  return value
}

/**
 * Resolve token references
 */
export function resolveReferences(
  stringifyContext: StringifyContext,
  transformContext: Partial<PinceauTransformContext>,
  pinceauContext: Partial<PinceauContext> & { $tokens: TokensFunction },
) {
  let { value } = stringifyContext
  if (!(typeof value === 'string')) { return value }
  value = value.replace(
    referencesRegex,
    (_, tokenPath) => {
      const varName = pathToVarName(tokenPath)
      const variable = `var(${varName})`

      if (Object.keys(transformContext?.localTokens || {}).includes(varName)) { return variable }

      const token = pinceauContext.$tokens(tokenPath, { key: undefined, loc: transformContext?.loc }) as DesignToken

      const tokenValue = typeof token === 'string' ? token : (token?.variable || token?.value)

      // Fallback if value does not exist
      if (!tokenValue) { return variable }

      return tokenValue as string
    },
  )
  return value
}

/**
 * Resolve custom directives (@mq, @dark).
 */
export function resolveCustomDirectives(
  stringifyContext: StringifyContext,
  transformContext: Partial<PinceauTransformContext>,
  pinceauContext: Partial<PinceauContext> & { $tokens: TokensFunction; options: PinceauOptions },
) {
  const { property, value } = stringifyContext

  if (property.startsWith('@')) {
    const resolveColorScheme = (scheme: string) => {
      scheme = pinceauContext.options.colorSchemeMode === 'class'
        ? `:root.${scheme}`
        : `@media (prefers-color-scheme: ${scheme})`

      const isMedia = scheme.startsWith('@media')

      // Runtime styling needs to be wrapped in `@media` as it does not get processed through PostCSS
      if (pinceauContext?.runtime) {
        return {
          '@media': {
            [scheme]: value,
          },
        }
      }

      return { [isMedia ? scheme : `${scheme} &`]: value }
    }

    // @dark
    if (property === DARK) { return resolveColorScheme('dark') }

    // @light
    if (property === LIGHT) { return resolveColorScheme('light') }

    // @initial
    if (property === INITIAL) {
      const token = pinceauContext.$tokens('media.initial' as any, { key: 'value', onNotFound: false, loc: transformContext.loc })
      return {
        [`@media${token ? ` ${token}` : ''}`]: value,
      }
    }

    // Handle all user supplied @directives
    const mediaQueries = pinceauContext.$tokens('media' as any, { key: undefined, loc: transformContext.loc })
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
 * Return a theme rule from a media query key, some content and a theme.
 */
export function resolveThemeRule(
  mq: PinceauMediaQueries,
  content: string,
  tokens: DesignTokens,
  colorSchemeMode: ColorSchemeModes,
) {
  let responsiveSelector: RawTokenType = ''

  if (mq === 'dark' || mq === 'light') {
    if (colorSchemeMode === 'class') { responsiveSelector = `:root.${mq}` }
    else { responsiveSelector = `(prefers-color-scheme: ${mq})` }
  }
  else if (mq !== 'initial' && tokens) {
    const queryToken = tokens?.media?.[mq] as DesignToken
    if (queryToken) { responsiveSelector = queryToken?.value as string }
  }

  let prefix
  if (!responsiveSelector) { prefix = '@media { :root {' }
  else if (responsiveSelector.startsWith('.')) { prefix = `@media { :root${responsiveSelector} {` }
  else if (responsiveSelector.startsWith(':root')) { prefix = `@media { ${responsiveSelector} {` }
  else { prefix = `@media ${responsiveSelector} { :root {` }

  return `${`${`${prefix}--pinceau-mq: ${String(mq)}; ${content}`} } }`}\n`
}
