import { useStorage } from '#internal/nitro'

export default async function (nitro) {
  nitro.hooks.hook('render:html', async (htmlContext, { event }) => {
    // Grab `theme.css` content from bundledStorage
    const theme = await useStorage().getItem('pinceau:theme.css')

    // Grab $pinceauSSR context from runtime plugin
    const $pinceauSSR = event.$pinceauSSR || { css: '', options: {} }

    // HMR
    if ($pinceauSSR.options?.dev) {
      const hmrScript = '<script type="module" data-vite-dev-id="@pinceau/outputs/hmr" src="/_nuxt/@id/@pinceau/outputs/hmr"></script>'
      htmlContext.head.splice(2, 0, hmrScript)
    }

    // Runtime sheet
    if ($pinceauSSR.options?.ssr?.runtime) { htmlContext.head.splice(2, 0, `<style id="pinceau-runtime">${$pinceauSSR?.css || ''}</style>`) }

    // Theme sheet
    if ($pinceauSSR.options?.ssr?.theme) { htmlContext.head.splice(2, 0, `<style id="pinceau-theme" ${$pinceauSSR.options?.dev ? 'data-vite-dev-id="@pinceau/outputs/theme.css"' : ''}>${theme || ''}</style>`) }
  })
}
