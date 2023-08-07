import { getPinceauContext, outputFileNames, usePinceauTransformContext } from '@pinceau/core'
import type { PinceauContext, PinceauTransforms } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { PinceauConfigContext } from './types'
import { transformIndexHtml } from './html'
import { usePinceauConfigContext } from './context'
import { registerVirtualOutputs } from './virtual'
import { transformTokenHelper } from './transforms'

const PinceauThemePlugin = createUnplugin(() => {
  let ctx: PinceauContext
  let configCtx: PinceauConfigContext

  const transforms: PinceauTransforms = {
    templates: [
      (transformContext, pinceauContext) => {
        transformTokenHelper(transformContext, pinceauContext, '`')
      },
    ],
    scripts: [
      (transformContext, pinceauContext) => {
        transformTokenHelper(transformContext, pinceauContext, '`')
      },
    ],
    styles: [
      (transformContext, pinceauContext) => {
        transformTokenHelper(transformContext, pinceauContext, '')
      },
    ],
    customs: [],
  }

  return {
    name: 'pinceau:theme-plugin',

    enforce: 'pre',

    vite: {
      async configureServer(server) {
        ctx = getPinceauContext(server)

        registerVirtualOutputs(ctx)

        configCtx = usePinceauConfigContext(ctx)

        await configCtx.ready
      },

      transformIndexHtml: {
        order: 'post',
        handler: async html => await transformIndexHtml(html, ctx),
      },

      async handleHotUpdate(hmrContext) {
        // Handle theme sources HMR
        if (configCtx.sources.find(source => source === hmrContext.file)) {
          const builtTheme = await configCtx.buildTheme()

          // Virtual imports ids
          const ids = [...outputFileNames]

          // Use transformed files as well
          Object.entries(ctx.transformed).forEach(([path, value]) => value && !ids.includes(path) && ids.push(path))

          // Loop on ids
          for (const id of ids) {
            const _module = hmrContext.server.moduleGraph.getModuleById(id)
            if (!_module) { continue }
            hmrContext.server.reloadModule(_module)
          }

          // Sent HMR event to client
          hmrContext.server.ws.send({
            type: 'custom',
            event: 'pinceau:theme',
            data: {
              css: builtTheme.outputs['pinceau.css'],
              theme: builtTheme.tokens,
            },
          })
        }
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

      return transformContext.result()
    },
  }
})

export default PinceauThemePlugin
