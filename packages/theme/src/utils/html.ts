import type { PinceauContext } from '@pinceau/core'
import { parseTemplate, printTemplate, walkTemplate } from '@pinceau/core/utils'
import { ELEMENT_NODE } from 'ultrahtml'

export function getHtmlTags(ctx: PinceauContext) {
  const options = ctx.options

  // Vite replace Pinceau theme injection by actual content of `pinceau.css`
  let hmrScript: string = ''
  let devId: string = ''
  let preflightPath: string | undefined = ''

  // Enables HMR in development
  if (options.dev) {
    devId = ` data-vite-dev-id="${ctx.getOutputId('@pinceau/outputs/theme.css')}"`
    hmrScript = '<script type="module" data-vite-dev-id="@pinceau/outputs/hmr" src="/__pinceau_hmr.js"></script>'
  }

  if (options.theme.preflight) {
    preflightPath = ctx.resolve?.(`@unocss/reset/${typeof options.theme.preflight === 'boolean' ? 'tailwind' : options.theme.preflight}.css`)
  }

  const preflight = preflightPath ? `<link rel="stylesheet" type="text/css" href="${preflightPath}" />` : ''

  return {
    preflight,
    theme: `<style type="text/css" id="pinceau-theme"${devId}>${ctx.getOutput('@pinceau/outputs/theme.css')}</style>`,
    runtime: ctx.options.runtime ? '<style id="pinceau-runtime"></style>' : undefined,
    hmrScript,
  }
}

export async function transformIndexHtml(html: string, ctx: PinceauContext) {
  if (!ctx.options.theme.transformIndexHtml) { return html }

  const tags = Object.values(getHtmlTags(ctx)).filter(Boolean).join('\n')

  // Support `<pinceau />`
  if (ctx.options.theme.pinceauHtmlTag) {
    const hasHtmlTag = html.includes('<pinceau />')
    if (hasHtmlTag) { return html.replace('<pinceau />', tags) }
  }

  if (ctx.options.theme.enforceHtmlInject) {
    const parsedHtml = parseTemplate(html)

    const tagsAst = parseTemplate(`<head>${tags}</head>`).children[0].children

    let hasHead: boolean = false

    await walkTemplate(
      parsedHtml,
      (node) => {
        if (node.type === ELEMENT_NODE && node.name === 'head') {
          const lastMetaTag = node.children.filter(node => node.type === ELEMENT_NODE && node.name === 'meta').slice(-1)?.[0]
          const lastMetaTagIndex = node.children.findIndex(node => node === lastMetaTag)

          if (lastMetaTagIndex !== -1) {
            node.children.splice(lastMetaTagIndex + 1, 0, ...tagsAst)
          }
          else {
            node.children.unshift(...tagsAst)
          }

          hasHead = true
        }
      },
    )

    if (!hasHead && parsedHtml.children) {
      parsedHtml.children.push(...tagsAst)
    }

    return await printTemplate(parsedHtml)
  }

  return html
}
