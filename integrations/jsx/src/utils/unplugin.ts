import { getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import { suite } from '../transforms/suite'
import { registerVirtualOutputs } from './virtual'

export const PinceauJSXPlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:jsx-plugin',

    enforce: 'pre',

    vite: {
      async configResolved(config) {
        ctx = getPinceauContext(config)

        registerVirtualOutputs(ctx)
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: async (code, id) => await transform(code, id, suite, ctx),
  }
})

export default PinceauJSXPlugin
