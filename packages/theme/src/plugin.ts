import { getPinceauContext } from '@pinceau/shared'
import type { PinceauConfigContext, PinceauContext } from '@pinceau/shared'
import { createUnplugin } from 'unplugin'
import { transformIndexHtmlHandler } from './html'
import { usePinceauConfigContext } from './context'
import { registerVirtualOutputs } from './virtual'

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
  }
})

export default PinceauThemePlugin
