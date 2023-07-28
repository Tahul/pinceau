import { getPinceauContext, usePinceauTransformContext } from '@pinceau/core'
import type { PinceauContext } from '@pinceau/core'
import { transformTokenHelper } from '@pinceau/theme/transforms'
import { createUnplugin } from 'unplugin'
import { loadFile } from '../../vue/src/load'

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

      if (!query || query.sfc) { return }

      const transformContext = usePinceauTransformContext(code, query, ctx)

      transformTokenHelper(transformContext, ctx)

      console.log({
        plugin: 'style',
        type: 'transformed',
        id,
      })

      return transformContext.result()
    },

    loadInclude(id) {
      const query = ctx.loaded[id]

      return !!query
    },

    load(id) {
      const query = ctx.loaded[id]

      if (!query || query.sfc) { return }

      const file = loadFile(query) || ''

      const transformContext = usePinceauTransformContext(file, query, ctx)

      console.log({
        plugin: 'style',
        type: 'loaded',
        id,
      })

      transformTokenHelper(transformContext, ctx)

      return transformContext.result()
    },
  }
})

export default PinceauStylePlugin
