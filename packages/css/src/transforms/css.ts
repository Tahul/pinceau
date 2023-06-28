import type { PinceauContext, PinceauTransformContext } from '@pinceau/shared'
import { darkRegex, lightRegex, mqCssRegex } from '@pinceau/shared'
import { transformDtHelper } from './dt'

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformCSS(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  let code = transformContext.code
  code = transformDtHelper({ code }, pinceauContext)
  code = transformMediaQueries({ ...transformContext, code }, pinceauContext)
  code = transformColorScheme({ ...transformContext, code })

  if (transformContext?.loc) {
    transformContext.magicString.remove(0, transformContext.loc.source.length)
    transformContext.magicString.prependLeft(transformContext.loc.source.length, code)
  }
}

/**
 * Transform media scheme into proper declaration
 */
export function transformColorScheme(
  transformContext: PinceauTransformContext,
) {
  const { code } = transformContext

  // Only supports `light` and `dark` schemes as they are native from browsers.
  const schemesRegex = {
    light: lightRegex,
    dark: darkRegex,
  }

  // Loop through supported color schemes
  Object.entries(schemesRegex).forEach(
    ([key, value]) => {
      code.replace(
        value,
        () => {
          const mq = `@media (prefers-color-scheme: ${key}) {`
          return mq
        },
      )
    },
  )

  return code
}

/**
 * Resolve `@{media.xl}` declarations.
 */
export function transformMediaQueries(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
): string {
  const { code } = transformContext

  const mediaQueries = pinceauContext.$tokens('media', { key: undefined, loc: transformContext.loc })

  return code.replace(
    mqCssRegex,
    (declaration, ...args) => {
      const mq = mediaQueries?.[args[0]]
      if (!mq) { return declaration }
      return `@media ${mq.value} {`
    },
  )
}
