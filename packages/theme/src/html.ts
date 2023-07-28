import type { PinceauContext } from '@pinceau/core'

export function transformIndexHtmlHandler(html: string, ctx: PinceauContext) {
  // Vite replace Pinceau theme injection by actual content of `pinceau.css`
  let hmrScript = ''
  let devId = ''

  // Enables HMR in development
  if (ctx.options.dev) {
    devId = ' data-vite-dev-id="pinceau.css"'
    hmrScript = '<script type="module" src="/__pinceau_hmr.ts"></script>'
  }

  const themeOutput = `<style type="text/css" id="pinceau-theme"${devId}>${ctx.getOutput('pinceau.css')}</style>${hmrScript}`

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
}
