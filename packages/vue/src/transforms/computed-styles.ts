import type { PinceauTransformFunction } from '@pinceau/core'

/**
 * Takes variants object and turns it into a `const` inside `<script setup>`
 */
export const transformComputedStyles: PinceauTransformFunction = (
  transformContext,
  pinceauContext,
) => {
  const { target } = transformContext

  const isTs = target.lang === 'ts' || target.attrs.lang === 'ts'

  for (const [_, cssFunction] of Object.entries(transformContext?.state?.cssFunctions || {})) {
    if (!cssFunction?.computedStyles) { continue }

    cssFunction
      .computedStyles
      .forEach((computedStyle) => {
        target.append(`\nuseComputedStyle(\'${computedStyle.variable}\', ${computedStyle.compiled})\n`)
      })
  }
}
