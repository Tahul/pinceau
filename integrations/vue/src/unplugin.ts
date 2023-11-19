import { PINCEAU_SCRIPTS_EXTENSIONS, getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import { suite } from './transforms/suite'
import { registerVirtualOutputs } from './utils/virtual'
import { PinceauVueTransformer } from './utils/transformer'
import { pluginTypes } from './utils/plugin-types'

export { registerVirtualOutputs }

export const PinceauVuePlugin: UnpluginInstance<undefined> = createUnplugin(() => {
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
            if (ctx.vueQuery && ctx.type === 'script') {
              return true
            }
          },
        )

        ctx.addTypes(pluginTypes)

        registerVirtualOutputs(ctx)
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: async (code, id) => {
      const query = ctx.transformed[id]

      if (
        query.sfc === 'vue'
        || query.type === 'style'
        || PINCEAU_SCRIPTS_EXTENSIONS.includes(query.ext)
      ) {
        return await transform(code, id, suite, ctx)
      }
    },
  }
})
