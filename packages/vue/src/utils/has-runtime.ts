import type { PinceauTransformContext } from '@pinceau/core'

export function hasRuntimeStyling(
  transformContext: PinceauTransformContext,
  type?: 'computedStyles' | 'variants',
) {
  return (Object.values(transformContext?.state?.styleFunctions || {})).some(
    (cssFunction) => {
      if (type === 'computedStyles') { return cssFunction.computedStyles.length }
      if (type === 'variants') { return Object.keys(cssFunction.variants).length }
      return cssFunction.computedStyles.length || Object.keys(cssFunction.variants).length
    },
  )
}
