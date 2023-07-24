import { getPinceauContext } from '@pinceau/shared'
import type { PinceauContext } from '@pinceau/shared'
import { createUnplugin } from 'unplugin'

const PinceauStylePlugin = createUnplugin(() => {
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

      console.log({
        plugin: 'style',
        type: 'transform',
        id,
        code,
        query,
      })

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

export default PinceauStylePlugin
