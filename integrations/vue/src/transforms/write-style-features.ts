import type { PinceauTransformFunction } from '@pinceau/core'

/**
 * Takes variants object and turns it into a `const` inside `<script setup>`
 */
export const transformWriteStyleFeatures: PinceauTransformFunction = async (
  transformContext,
  pinceauContext,
) => {
  const { target } = transformContext

  // Only target current block type functions
  const targetScopedContexts = Object.entries(transformContext.state?.styleFunctions || {}).filter(([key]) => key.startsWith(`${target.type}${target.index}`))

  // Walk through styled functions state and replace pointers in target
  for (const [id, styleFunction] of targetScopedContexts) {
    // Skip already applied static functions; should not happen.
    if (styleFunction.applied.static) { continue }

    // `css()` in `<style>`
    if (target.type === 'style') {
      // Append the compiled style to the original <style> tag it is coming from, in the order it is written
      target.append(`\n${styleFunction.css}\n`)
    }

    if (target.type === 'script') {
      // Push a `<style scoped pinceau-css-function>` at the bottom of the component
      transformContext.ms.append(`\n<style scoped pc-fn="${id}">${styleFunction.css}</style>`)
    }

    if (target.type === 'template') {
      // Push a `<style scoped pinceau-css-function>` at the bottom of the component
      transformContext.ms.append(`\n<style scoped pc-fn="${id}">${styleFunction.css}</style>`)
    }

    // If `ws` server present, send an event updating that specific `css` function style with HMR
    // This can't be done in `handleHotUpdate` as HMR event is triggered before `<style>` is appended to the component
    if (pinceauContext?.devServer?.ws && (target.type === 'script' || target.type === 'template')) {
      pinceauContext.devServer.ws.send({
        type: 'custom',
        event: 'pinceau:style-function',
        data: {
          id,
          filename: transformContext.query.filename,
          css: styleFunction.css,
          selector: `[data-vite-dev-id*="pc-fn"][data-vite-dev-id*="${id.replace('$', '%24')}"]`,
        },
      })
    }

    styleFunction.applied.static = true
  }
}
