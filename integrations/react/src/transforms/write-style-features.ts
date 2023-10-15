import type { PinceauTransformFunction } from '@pinceau/core'
import type { ViteDevServer } from 'vite'

/**
 * Takes variants object and turns it into a `const` inside `<script setup>`
 */
export const transformWriteStyleFeatures: PinceauTransformFunction = async (
  transformContext,
  pinceauContext,
) => {
  const { target } = transformContext

  const writeableFns: string[] = []

  // Walk through styled functions state and replace pointers in target
  for (const [id, styleFunction] of Object.entries(transformContext.state?.styleFunctions || {})) {
    if (styleFunction.applied.static) { continue }

    const styleModuleId = `$pinceau/style-functions.css?src=${transformContext.query.id}&pc-fn=${id}`

    writeableFns.push(`import \'${styleModuleId}\'`)

    styleFunction.applied.static = true

    if (pinceauContext?.devServer) {
      // Invalidate module
      const devServer = pinceauContext.devServer as ViteDevServer
      const styleModule = devServer.moduleGraph.getModuleById(styleModuleId)
      if (styleModule) { devServer.moduleGraph.invalidateModule(styleModule) }
    }

    // If `ws` server present, send an event updating that specific `css` function style with HMR
    // This can't be done in `handleHotUpdate` as HMR event is triggered before `<style>` is appended to the component
    if (
      pinceauContext?.devServer?.ws
      && (target.type === 'script' || target.type === 'template')
    ) {
      pinceauContext.devServer.ws.send({
        type: 'custom',
        event: 'pinceau:style-function',
        data: {
          id,
          filename: transformContext.query.filename,
          css: styleFunction.css,
          selector: `[data-vite-dev-id="$pinceau/style-functions.css?src=${transformContext.query.filename}&pc-fn=${id}"]`,
        },
      })
    }
  }

  if (writeableFns.length) { target.prepend(`\n${writeableFns.join('\n')}\n`) }
}
