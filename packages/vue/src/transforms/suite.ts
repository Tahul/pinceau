import type { PinceauTransforms } from '@pinceau/core'
import { hasRuntimeStyling } from '../utils/has-runtime'
import { transformAddPinceauClass } from './add-class'
import { transformAddRuntimeScriptTag, transformScriptFeatures } from './write-script-features'
import { transformWriteStyleFeatures } from './write-style-features'

/**
 * @pinceau/vue transforms suite.
 */
export const suite: PinceauTransforms = {
  globals: [
    transformAddRuntimeScriptTag,
  ],
  templates: [
    transformWriteStyleFeatures,
    (transformContext, pinceauContext) => {
      if (!transformContext?.state?.styleFunctions) { return }

      const hasRuntime = hasRuntimeStyling(transformContext)

      if (hasRuntime) {
        transformAddPinceauClass(transformContext, pinceauContext)
      }
    },
  ],
  scripts: [
    transformWriteStyleFeatures,
    transformScriptFeatures,
  ],
  styles: [
    (transformContext, pinceauContext) => {
      // Skip `pinceau-style-function` tags since those are already handled in earlier transformation
      if (transformContext.query.styleFunction) { return }
      transformWriteStyleFeatures(transformContext, pinceauContext)
    },
  ],
}
