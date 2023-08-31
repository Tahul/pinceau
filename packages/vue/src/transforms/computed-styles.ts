import type { PinceauTransformFunction } from '@pinceau/core'

/**
 * Takes variants object and turns it into a `const` inside `<script setup>`
 */
export const transformComputedStyles: PinceauTransformFunction = (
  transformContext,
) => {
  const { target } = transformContext

  if (!target.setup) { return }

  for (const [_, cssFunction] of Object.entries(transformContext?.state?.styleFunctions || {})) {
    if (!cssFunction?.computedStyles) { continue }

    cssFunction
      .computedStyles
      .forEach((computedStyle) => {
        target.append(`\nuseComputedStyle(\'${computedStyle.variable}\', ${computedStyle.compiled})\n`)
      })
  }
}
