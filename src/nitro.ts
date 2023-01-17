import type { NitroAppPlugin } from 'nitropack'
// @ts-expect-error nitro virtual import
import { useStorage } from '#internal/nitro'

export default <NitroAppPlugin> async function (nitro) {
  nitro.hooks.hook('render:html', async (htmlContext, { event }) => {
    const theme = await useStorage().getItem('pinceau:index.css')
    const pinceauContent = event?.pinceauContent || { theme: '', runtime: '' }
    htmlContext.head.splice(2, 0, `<style id="pinceau-runtime-hydratable">${pinceauContent.runtime}</style>`)
    htmlContext.head.splice(2, 0, `<style id="pinceau-theme">${theme}</style>`)
  })
}
