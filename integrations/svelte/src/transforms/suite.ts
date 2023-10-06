import type { PinceauTransforms } from '@pinceau/core'
import { transformWriteStyleFeatures } from './write-style-features'
import { transformAddRuntimeScriptTag, transformWriteScriptFeatures } from './write-script-features'

export const suite: PinceauTransforms = {
  globals: [
    transformAddRuntimeScriptTag
  ],
  scripts: [
    transformWriteScriptFeatures,
    transformWriteStyleFeatures,
  ],
}
