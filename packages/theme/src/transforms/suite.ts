/* c8 ignore start */
import type { PinceauTransforms } from '@pinceau/core'
import { transformThemeHelper } from './theme-helper'
import { transformMediaQueries } from './media-queries'
import { transformColorScheme } from './color-scheme'

export const suite: PinceauTransforms = {
  templates: [
    (transformContext, pinceauContext) => {
      transformThemeHelper(transformContext, pinceauContext, '`')
    },
  ],
  scripts: [
    (transformContext, pinceauContext) => {
      transformThemeHelper(transformContext, pinceauContext, '`')
    },
  ],
  styles: [
    (transformContext, pinceauContext) => {
      transformThemeHelper(transformContext, pinceauContext)
      transformMediaQueries(transformContext, pinceauContext)
      transformColorScheme(transformContext, pinceauContext)
    },
  ],
}
