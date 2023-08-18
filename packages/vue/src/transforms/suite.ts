import type { PinceauTransforms } from '@pinceau/core'
import { hasRuntimeStyling } from '../utils/has-runtime'
import { transformAddPinceauClass } from './add-class'
import { transformAddRuntimeImports, transformAddRuntimeSetup } from './runtime-setup'
import { transformVariants } from './variants'
import { transformComputedStyles } from './computed-styles'

/**
 * @pinceau/vue transforms suite.
 */
export const suite: PinceauTransforms = {
  templates: [
    (transformContext, pinceauContext) => {
      if (!transformContext?.state?.cssFunctions) { return }

      const hasRuntime = hasRuntimeStyling(transformContext)

      if (hasRuntime) { transformAddPinceauClass(transformContext, pinceauContext) }
    },
  ],
  scripts: [
    (transformContext, pinceauContext) => {
      if (!transformContext?.state?.cssFunctions) { return }

      const hasRuntime = hasRuntimeStyling(transformContext)

      if (hasRuntime && transformContext.target.attrs.setup) {
        transformAddRuntimeImports(transformContext, pinceauContext)
        transformAddRuntimeSetup(transformContext, pinceauContext)
        transformVariants(transformContext, pinceauContext)
        transformComputedStyles(transformContext, pinceauContext)
      }
    },
  ],
}
