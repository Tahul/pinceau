import type { PinceauTransforms } from '@pinceau/core'
import { transformWriteStyleFeatures } from './write-style-features'
import { transformWriteScriptFeatures } from './write-script-features'

export const suite: PinceauTransforms = {
  templates: [
  ],
  scripts: [
    transformWriteScriptFeatures,
    transformWriteStyleFeatures,
  ],
  styles: [
  ],
}
