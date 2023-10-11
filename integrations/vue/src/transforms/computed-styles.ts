import type { PinceauTransformFunction } from '@pinceau/core'

/**
 * Takes variants object and turns it into a `const` inside `<script setup>`
 */
export const transformComputedStyles: PinceauTransformFunction = async (
  transformContext,
) => {
  const { target } = transformContext

  if (!target?.attrs?.setup) { return }

  const fns: string[] = []

  for (const [_, cssFunction] of Object.entries(transformContext?.state?.styleFunctions || {})) {
    if (!cssFunction?.computedStyles?.length) { continue }

    cssFunction
      .computedStyles
      .forEach(computedStyle => fns.push(`[\'${computedStyle.variable}\', ${computedStyle.compiled}]`))
  }

  if (fns.length) { target.append(`\nconst $pcExtractedComputedStyles = [\n${fns.join(', \n')}\n]\n`) }
}
