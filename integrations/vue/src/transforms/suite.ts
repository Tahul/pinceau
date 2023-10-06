import type { PinceauTransforms } from '@pinceau/core'
import { transformAddPinceauClass } from './add-class'
import {
  transformAddRuntimeScriptTag,
  transformWriteScriptFeatures,
} from './write-script-features'
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
    transformAddPinceauClass,
  ],
  scripts: [
    transformWriteScriptFeatures,
    transformWriteStyleFeatures,
  ],
  styles: [
    async (transformContext, pinceauContext) => {
      // Skip `pc-fn` tags since those are already handled in earlier transformation
      if (transformContext.query.styleFunction) { return }

      await transformWriteStyleFeatures(transformContext, pinceauContext)
    },
  ],
}
