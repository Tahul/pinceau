import type { PinceauContext, PinceauTransformContext, PinceauTransformFunction } from '@pinceau/core'

const schemesRegex = /(@(dark|light)\s{)/gm

// TOOD: COMBINE THIS IN A SINGLE REGEX

/**
 * Transform media scheme into proper declaration
 */
export const transformColorScheme: PinceauTransformFunction = (
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
) => {
  transformContext.target.toString().replace(
    schemesRegex,
    (match, ...args) => {
      const key = args[1]

      let mq
      if (pinceauContext.options.theme.colorSchemeMode === 'media') { mq = `@media (prefers-color-scheme: ${key}) {` }
      else { mq = `:root.${key} {` }

      transformContext.target.overwrite(args[2], args[2] + match.length, mq)

      return mq
    },
  )
}
