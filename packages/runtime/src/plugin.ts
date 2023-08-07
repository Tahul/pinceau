import { createUnplugin } from 'unplugin'
import { getPinceauContext } from '@pinceau/core'
import type { PinceauContext } from '@pinceau/core'

const PinceauRuntimePlugin = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:runtime-plugin',

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

      return code
    },
  }
})

export default PinceauRuntimePlugin
