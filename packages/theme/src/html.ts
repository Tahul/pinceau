import type { PinceauContext } from '@pinceau/core'

export async function transformIndexHtml(html: string, ctx: PinceauContext) {
  const options = ctx.options

  // Vite replace Pinceau theme injection by actual content of `pinceau.css`
  let hmrScript = ''
  let devId = ''
  let preflightPath = ''

  // Enables HMR in development
  if (options.dev) {
    devId = ` data-vite-dev-id="${ctx.getOutputId('pinceau.css')}"`
    hmrScript = '<script type="module" data-vite-dev-id="$pinceau/hmr" src="/__pinceau_hmr.ts"></script>'
  }

  if (options.theme.preflight) {
    preflightPath = require.resolve(`@unocss/reset/${typeof options.theme.preflight === 'boolean' ? 'tailwind' : options.theme.preflight}.css`)
  }

  const preflight = preflightPath ? `<link rel="stylesheet" type="text/css" href="${preflightPath}" />` : ''

  const tags = `${preflight}\n<style type="text/css" id="pinceau-theme"${devId}>${ctx.getOutput('pinceau.css')}</style>\n${hmrScript}`

  // Support `<pinceau />`
  html = html.replace('<pinceau />', tags)

  // Support `<style id="pinceau-theme"></style>` (Slidev / index.html merging frameworks)
  html = html.replace('<style id="pinceau-theme"></style>', tags)

  return html
}
