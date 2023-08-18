import type { PinceauContext, PinceauTransformContext } from '@pinceau/core'

/**
 * Resolve `@{media.xl}` declarations.
 */
export function transformMediaQueries(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) {
  const mediaQueries = pinceauContext.$tokens('media')

  transformContext.target.toString().replace(
    // In CSS media query regex.
    /@([^\s]+)\s{/g,
    (declaration, ...args) => {
      const mq = mediaQueries?.[args[0]]

      if (!mq) { return declaration }

      const result = `@media ${mq.value} {`

      transformContext.target.overwrite(args[1], args[1] + declaration.length, result)

      return result
    },
  )
}
