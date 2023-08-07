import { useStorage } from '#internal/nitro'

export default async function (nitro) {
  nitro.hooks.hook('render:html', async (htmlContext, { event }) => {
    const theme = await useStorage().getItem('pinceau:theme.css')
    const dev = 'data-vite-dev-id="pinceau.css"'
    const pinceauContent = event.pinceauContent || { theme: undefined, runtime: undefined, options: undefined }
    const isDev = pinceauContent.options?.dev

    if (isDev) {
      const hmrScript = '<script type="module" data-vite-dev-id="$pinceau/hmr" src="/_nuxt/@id/$pinceau/hmr"></script>'
      htmlContext.head.splice(2, 0, hmrScript)
    }

    if (!theme?.theme) { htmlContext.head.splice(2, 0, `<style id="pinceau-theme" ${isDev ? dev : ''}>${theme || ''}</style>`) }
    if (!theme?.runtime) { htmlContext.head.splice(2, 0, `<style id="pinceau-runtime">${pinceauContent?.runtime || ''}</style>`) }
  })
}
