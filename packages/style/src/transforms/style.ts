import type { PinceauContext, PinceauTransformContext } from '@pinceau/core'
import { darkRegex, lightRegex, mqCssRegex } from '../regexes'

/**
 * Transform media scheme into proper declaration
 */
export function transformColorScheme(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  // Only supports `light` and `dark` schemes as they are native from browsers.
  const schemesRegex = {
    light: lightRegex,
    dark: darkRegex,
  }

  // Loop through supported color schemes
  Object.entries(schemesRegex).forEach(
    ([key, value]) => {
      transformContext.ms.toString().replace(
        value,
        () => {
          let mq
          if (pinceauContext.options.theme.colorSchemeMode === 'media') { mq = `@media (prefers-color-scheme: ${key}) {` }
          else { mq = `:root.${key} {` }
          return mq
        },
      )
    },
  )
}

/**
 * Resolve `@{media.xl}` declarations.
 */
export function transformMediaQueries(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
): string {
  const mediaQueries = pinceauContext.$tokens('media', { key: undefined, loc: transformContext?.loc })

  return transformContext.ms.toString().replace(
    mqCssRegex,
    (declaration, ...args) => {
      const mq = mediaQueries?.[args[0]]
      if (!mq) { return declaration }
      return `@media ${mq.value} {`
    },
  )
}
