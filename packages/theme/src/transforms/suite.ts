/* c8 ignore start */
import type { PinceauTransforms } from '@pinceau/core'
import { transformTokenHelper } from './token-helper'
import { transformMediaQueries } from './media-queries'
import { transformColorScheme } from './color-scheme'

export const suite: PinceauTransforms = {
  templates: [
    (transformContext, pinceauContext) => {
      transformTokenHelper(transformContext, pinceauContext, '`')
    },
  ],
  scripts: [
    (transformContext, pinceauContext) => {
      transformTokenHelper(transformContext, pinceauContext, '`')
    },
  ],
  styles: [
    (transformContext, pinceauContext) => {
      transformTokenHelper(transformContext, pinceauContext)
      transformMediaQueries(transformContext, pinceauContext)
      transformColorScheme(transformContext, pinceauContext)
    },
  ],
}
