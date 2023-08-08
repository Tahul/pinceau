import { getPinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import type { PinceauContext, PinceauTransforms } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import { transformCSSFunctions } from './transforms'

const PinceauStylePlugin = createUnplugin(() => {
  let ctx: PinceauContext

  const transforms: PinceauTransforms = {
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
          (transformCtx.query?.transformed || transformCtx.target?.attrs?.transformed)
          || (transformCtx.query?.type === 'style' && transformCtx.query?.lang === 'ts')
        ) {
          transformCSSFunctions(transformCtx, pinceauCtx, true)
        }
      },
    ],
    templates: [],
    customs: [],
  }

  return {
    name: 'pinceau:style-plugin',

    enforce: 'pre',

    vite: {
      async configureServer(server) {
        ctx = getPinceauContext(server)
      },
    },

    transformInclude(id) {
      const query = ctx.transformed[id]
      return !!query
    },

    transform(code, id) {
      const query = ctx.transformed[id]

      const transformContext = usePinceauTransformContext(code, query, ctx)

      transformContext.registerTransforms(transforms)

      transformContext.transform()

      return transformContext.result()
    },
  }
})

export default PinceauStylePlugin
