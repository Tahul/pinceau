import { getPinceauContext, usePinceauTransformContext } from '@pinceau/core/utils'
import type { PinceauContext, PinceauTransformContext, PinceauTransforms } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import { MagicVueSFC } from 'sfc-composer'
import { parse } from 'vue/compiler-sfc'
import { join } from 'pathe'
import { loadComponentBlock } from './load'
import { transformAddPinceauClass, transformAddRuntimeImports, transformAddRuntimeSetup, transformComputedStyles, transformStyleTs, transformVariants } from './transforms'
import { registerVirtualOutputs } from './virtual'

function hasRuntimeStyling(transformContext: PinceauTransformContext) {
  return Object.entries(transformContext.state.cssFunctions || {}).some(
    ([_, cssFunction]) => {
      if (
        cssFunction.computedStyles.length
        || cssFunction.variants.length
      ) return true

      return false
    },
  )
}

const PinceauVuePlugin = createUnplugin(() => {
  let ctx: PinceauContext

  const transforms: PinceauTransforms = {
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
    styles: [],
    customs: [],
  }

  return {
    name: 'pinceau:vue-plugin',

    enforce: 'pre',

    vite: {
      async configureServer(server) {
        ctx = getPinceauContext(server)

        ctx.registerTransformer(
          'vue',
          {
            MagicSFC: MagicVueSFC,
            parser: parse,
            loadBlock: loadComponentBlock,
            loadTransformers: [transformStyleTs],
          },
        )

        registerVirtualOutputs(ctx)

        ctx.writeOutput('$pinceau/runtime', join(ctx.options.theme.buildDir, 'runtime.ts'))
        ctx.writeOutput('$pinceau/vue-plugin', join(ctx.options.theme.buildDir, 'vue-plugin.ts'))
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

      console.log({ vue: id, state: transformContext.state })

      return transformContext.result()
    },
  }
})

export default PinceauVuePlugin
