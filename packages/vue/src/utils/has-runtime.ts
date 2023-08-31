import type { PinceauTransformContext } from '@pinceau/core'

export function hasRuntimeStyling(transformContext: PinceauTransformContext) {
  return (Object.values(transformContext?.state?.styleFunctions || {})).some(
    (cssFunction) => {
      if (
        cssFunction.computedStyles.length
        || cssFunction.variants.length
      ) return true

      return false
    },
  )
}
