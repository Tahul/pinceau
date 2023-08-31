import type { PinceauTransforms } from '@pinceau/core'
import { hasRuntimeStyling } from '../utils/has-runtime'
import { transformAddPinceauClass } from './add-class'
import { transformEndRuntimeSetup, transformStartRuntimeSetup } from './runtime-setup'
import { transformVariants } from './variants'
import { transformComputedStyles } from './computed-styles'
import { transformWriteStyleFeatures } from './write-style-features'

/**
 * @pinceau/vue transforms suite.
 */
export const suite: PinceauTransforms = {
  templates: [
    transformWriteStyleFeatures,
    (transformContext, pinceauContext) => {
      if (!transformContext?.state?.styleFunctions) { return }

      const hasRuntime = hasRuntimeStyling(transformContext)

      if (hasRuntime) { transformAddPinceauClass(transformContext, pinceauContext) }
    },
  ],
  scripts: [
    transformWriteStyleFeatures,
    (transformContext, pinceauContext) => {
      if (!transformContext?.state?.styleFunctions) { return }

      const hasRuntime = hasRuntimeStyling(transformContext)

      if (hasRuntime && transformContext.target?.attrs?.setup) {
        transformStartRuntimeSetup(transformContext, pinceauContext)
        transformVariants(transformContext, pinceauContext)
        transformComputedStyles(transformContext, pinceauContext)
        transformEndRuntimeSetup(transformContext, pinceauContext)
      }
    },
  ],
  styles: [
    (transformContext, pinceauContext) => {
      if (transformContext.query.styleFunction) { return }

      transformWriteStyleFeatures(transformContext, pinceauContext)
    },
  ],
}
