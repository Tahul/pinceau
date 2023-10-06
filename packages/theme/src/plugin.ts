/* c8 ignore start */
import { createRequire } from 'node:module'
import { getPinceauContext, transform, transformInclude } from '@pinceau/core/utils'
import type { PinceauContext } from '@pinceau/core'
import { createUnplugin } from 'unplugin'
import type { UnpluginInstance } from 'unplugin'
import type { PinceauConfigContext } from './types'
import { transformIndexHtml } from './utils/html'
import { usePinceauConfigContext } from './utils/config-context'
import { suite } from './transforms/suite'
import { setupThemeFormats } from './utils/setup'

const _require = createRequire(import.meta.url)

const PinceauThemePlugin: UnpluginInstance<undefined> = createUnplugin(() => {
  let ctx: PinceauContext
  let configCtx: PinceauConfigContext

  return {
    name: 'pinceau:theme-plugin',

    enforce: 'pre',

    vite: {
      api: {
        getPinceauConfigContext: () => configCtx,
      },

      async configResolved(config) {
        ctx = getPinceauContext(config)

        setupThemeFormats(ctx)

        configCtx = usePinceauConfigContext(ctx)

        await configCtx.buildTheme()
      },

      transformIndexHtml: {
        order: 'post',
        handler: async html => transformIndexHtml(html, ctx, _require.resolve),
      },

      async handleHotUpdate(hmrContext) {
        // Handle theme sources HMR
        if (configCtx.sources.find(source => source === hmrContext.file)) {
          const { theme, outputs } = await configCtx.buildTheme()

          // Virtual imports ids
          const ids = [...Object.keys(ctx.outputs)]

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
              css: outputs['pinceau.css'],
              theme,
            },
          })
        }
      },
    },

    transformInclude: id => transformInclude(id, ctx),

    transform: async (code, id) => await transform(code, id, suite, ctx),
  }
})

export default PinceauThemePlugin
