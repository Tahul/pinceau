import type { NitroAppPlugin } from 'nitropack'

export default <NitroAppPlugin> async function (nitro) {
  nitro.hooks.hook('render:html', (htmlContext, { event }) => {
    const pinceauContent = event?.pinceauContent || { theme: '', runtime: '' }
    htmlContext.head.splice(2, 0, `<style id="pinceau-runtime-hydratable">${pinceauContent.runtime}</style>`)
    htmlContext.head.splice(2, 0, `<style id="pinceau-theme">${pinceauContent.theme}</style>`)
  })
}
