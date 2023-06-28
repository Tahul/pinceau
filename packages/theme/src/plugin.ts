import { type PinceauContext, getPinceauContext } from '@pinceau/shared'
import { createUnplugin } from 'unplugin'

export const PinceauThemePlugin = createUnplugin(() => {
  let ctx: PinceauContext

  return {
    name: 'pinceau:theme-plugin',

    enforce: 'pre',

    vite: {
      configureServer(server) {
        ctx = getPinceauContext(server)
      },

      transformIndexHtml: {
        order: 'post',
        handler(html) {
          // Vite replace Pinceau theme injection by actual content of `pinceau.css`
          let hmrScript = ''
          let devId = ''

          // Enables HMR in development
          if (ctx.options.dev) {
            devId = ' data-vite-dev-id="/__pinceau_css.css"'
            hmrScript = '<script type="module" src="/__pinceau_hmr.ts"></script>'
          }

          const themeOutput = `<style type="text/css" id="pinceau-theme"${devId}>${ctx.getOutput('/__pinceau_css.css')}</style>${hmrScript}`

          // Support `<pinceau />`
          html = html.replace(
            '<pinceau />',
            themeOutput,
          )

          // Support `<style id="pinceau-theme"></style>` (Slidev / index.html merging frameworks)
          html = html.replace(
            '<style id="pinceau-theme"></style>',
            themeOutput,
          )

          return html
        },
      },
    },
  }
}).vite
