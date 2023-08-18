import type { PinceauTransforms } from '@pinceau/core'
import { transformCSSFunctions } from './css-function'

export const suite: PinceauTransforms = {
  scripts: [
    // TODO: Handle `const cssContext = css({ ... })`
    transformCSSFunctions,
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
        transformCSSFunctions(transformCtx, pinceauCtx, true)
      }
    },
  ],
}
