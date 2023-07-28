import { getPinceauContext, usePinceauTransformContext } from '@pinceau/core'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { PinceauConfigContext } from './types'
import { transformIndexHtmlHandler } from './html'
import { usePinceauConfigContext } from './context'
import { registerVirtualOutputs } from './virtual'
import { transformTokenHelper } from './transforms'

const PinceauThemePlugin = createUnplugin(() => {
  let ctx: PinceauContext
  let configCtx: PinceauConfigContext

  return {
    name: 'pinceau:theme-plugin',

    enforce: 'pre',

    vite: {
      async configureServer(server) {
        ctx = getPinceauContext(server)

        registerVirtualOutputs(ctx)

        configCtx = usePinceauConfigContext(ctx)

        await configCtx.ready

        configCtx.registerConfigWatchers()
      },

      transformIndexHtml: {
        order: 'post',
        handler: html => transformIndexHtmlHandler(html, ctx),
      },
    },

    transformInclude(id) {
      const query = ctx.transformed[id]

      return !!query
    },

    transform(code, id) {
      const query = ctx.transformed[id]

      console.log({
        plugin: 'theme',
        type: 'transformed',
        id,
      })

      const transformContext = usePinceauTransformContext(code, query)

      transformTokenHelper(transformContext, ctx)

      return code
    },

    loadInclude(id) {
      const query = ctx.loaded[id]

      return !!query
    },

    load(id): any {
      const query = ctx.loaded[id]

      console.log({
        plugin: 'theme',
        type: 'loaded',
        id,
      })
    },
  }
})

export default PinceauThemePlugin
