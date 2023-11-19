import { PINCEAU_SCRIPTS_EXTENSIONS, getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import { suite } from './transforms/suite'
import { PinceauSvelteTransformer } from './utils/transformer'
import { registerVirtualOutputs } from './utils/virtual'
import { pluginTypes } from './utils/plugin-types'

export { registerVirtualOutputs }

export const PinceauSveltePlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:svelte-plugin',

    enforce: 'pre',

    vite: {
      async configResolved(config) {
        ctx = getPinceauContext(config)

        ctx.registerTransformer(
          'svelte',
          PinceauSvelteTransformer,
        )

        ctx.addTypes(pluginTypes)

        registerVirtualOutputs(ctx)
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: async (code, id) => {
      const query = ctx.transformed[id]

      if (
        query.sfc === 'svelte'
        || PINCEAU_SCRIPTS_EXTENSIONS.includes(query.ext)
      ) { return await transform(code, id, suite, ctx) }
    },
  }
})
