import type { NitroAppPlugin } from 'nitropack'

export default <NitroAppPlugin> function (nitro) {
  nitro.hooks.hook('render:html', (htmlContext, { event }) => {
    const content = event?.pinceauContent || ''
    htmlContext.head.push(`<style id="pinceau">${content}</style>`)
  })
}
