import { createUnplugin } from 'unplugin'
import { getPinceauContext } from '@pinceau/core'
import type { PinceauContext } from '@pinceau/core'

const PinceauRuntimePlugin = createUnplugin(() => {
  let ctx: PinceauContext

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

      if (query) {
        if (ctx.options.vue && query.vue) { return }
        return true
      }

      return false
    },

    transform(code, id) {
      const query = ctx.transformed[id]

      return code
    },

    loadInclude(id) {
      const query = ctx.loaded[id]

      return !!query
    },

    load(id): any {
      const query = ctx.loaded[id]
    },
  }
})

export default PinceauRuntimePlugin
