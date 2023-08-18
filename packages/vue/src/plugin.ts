import { getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import { registerVirtualOutputs } from './utils/virtual'
import { PinceauVueTransformer } from './utils/transformer'
import { suite } from './transforms/suite'

const PinceauVuePlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:vue-plugin',

    enforce: 'pre',

    vite: {
      async configResolved(config) {
        ctx = getPinceauContext(config)

        ctx.registerTransformer(
          'vue',
          PinceauVueTransformer,
        )

        ctx.registerFilter(
          (ctx) => {
            // Skip `<script>` direct queries as they are made when components has already been transformed.
            // That step has already been processed by Pinceau's transforms.
            if (ctx.vueQuery && ctx.type === 'script') { return true }
          },
        )

        registerVirtualOutputs(ctx)
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: (code, id) => transform(code, id, suite, ctx),
  }
})

export default PinceauVuePlugin
