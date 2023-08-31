import type { PinceauTransforms } from '@pinceau/core'
import { transformStyleFunctions } from './style-functions'
import { transformStyledProps } from './styled-props'

export const suite: PinceauTransforms = {
  templates: [
    transformStyledProps,
  ],
  scripts: [
    transformStyleFunctions,
  ],
  styles: [
    (transformCtx, pinceauCtx) => {
      // Pick only:
      // - `<style lang="ts">` blocks that has been transformed to `<style lang="postcss" transformed=true">`
      // - `<style lang="ts">` blocks that has not been transformed in previous steps.
      if (
        (transformCtx.query.transformed || transformCtx.target?.attrs?.transformed)
          || (transformCtx.query.type === 'style' && transformCtx.query.lang === 'ts')
      ) {
        transformStyleFunctions(transformCtx, pinceauCtx)
      }
    },
  ],
}
