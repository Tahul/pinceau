import type { PinceauContext } from '@pinceau/core'

export function transformIndexHtml(html: string, ctx: PinceauContext) {
  const options = ctx.options

  // Vite replace Pinceau theme injection by actual content of `pinceau.css`
  let hmrScript: string = ''
  let devId: string = ''
  let preflightPath: string | undefined = ''

  // Enables HMR in development
  if (options.dev) {
    devId = ` data-vite-dev-id="${ctx.getOutputId('pinceau.css')}"`
    hmrScript = '<script type="module" data-vite-dev-id="@pinceau/outputs/hmr" src="/__pinceau_hmr.js"></script>'
  }

  if (options.theme.preflight) { preflightPath = ctx.require?.resolve(`@unocss/reset/${typeof options.theme.preflight === 'boolean' ? 'tailwind' : options.theme.preflight}.css`) }

  const preflight = preflightPath ? `<link rel="stylesheet" type="text/css" href="${preflightPath}" />` : ''

  const tags = {
    preflight,
    theme: `<style type="text/css" id="pinceau-theme"${devId}>${ctx.getOutput('pinceau.css')}</style>`,
    runtime: ctx.options.runtime ? '<style id="pinceau-runtime"></style>' : undefined,
    hmrScript,
  }

  // Support `<pinceau />`
  html = html.replace('<pinceau />', Object.values(tags).filter(Boolean).join('\n'))

  return html
}
