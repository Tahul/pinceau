import { createUnplugin } from 'unplugin'
import chalk from 'chalk'
import { consola } from 'consola'
import type { PinceauOptions } from './types'
import { updateDebugContext } from './utils/debug'
import { registerPostCSSPlugins } from './utils/postcss'
import { usePinceauContext } from './utils/context'
import { loadFile } from './utils/load'

const PinceauCorePlugin = createUnplugin<PinceauOptions>((options) => {
  // Setup debug context context.
  updateDebugContext({
    debugLevel: options?.dev ? options.debug : false,
    logger: consola.withTag(' 🖌 '),
    // chalk.bgBlue.blue
    tag: (value: any) => chalk.bgBlue.blue(value),
    // chalk.blue
    info: (value: any) => chalk.blue(value),
    // chalk.yellow
    warning: (value: any) => chalk.yellow(value),
    // chalk.red
    error: (value: any) => chalk.red(value),
  })

  const ctx = usePinceauContext(options)

  return {
    name: 'pinceau:core-plugin',

    enforce: 'pre',

    vite: {
      config(config) {
        registerPostCSSPlugins(config, ctx.options)
      },
      async configureServer(server) {
        // PinceauContext setup
        ctx.options.dev = true

        // PinceauContext injection
        ;(server as any)._pinceauContext = ctx
      },
      handleHotUpdate(hmrContext) {
        const defaultRead = hmrContext.read

        // Enforce load transformers even on HMR.
        hmrContext.read = async function () {
          let code = await defaultRead()

          const query = ctx.transformed[hmrContext.file]

          if (query) {
            // Find format transformer
            const transformer = ctx.transformers[query.ext]

            // Apply load transformers
            if (transformer && transformer?.loadTransformers?.length) {
              for (const transform of transformer.loadTransformers) {
                code = transform(code, query)
              }
            }
          }

          return code
        }
      },
    },

    resolveId(id) {
      return ctx.getOutputId(id)
    },

    /**
     * Global transform include check; Pinceau plugins will access this via `ctx.transformed`
     */
    transformInclude(id) {
      const query = ctx.transformed[id]

      return !!query
    },

    transform(code) {
      return code
    },

    /**
     * Global load include check; Pinceau plugins will access this via `ctx.loaded`
     */
    loadInclude(id) {
      const query = ctx.isTransformable(id)

      // ALlow virtual outputs by default
      if (ctx.getOutput(id)) { return true }

      // Push included file into context
      if (query && query?.transformable) { ctx.addTransformed(id, query) }

      return !!query
    },

    load(id) {
      // Load virtual outputs
      const output = ctx.getOutput(id)
      if (output) { return output }

      // Load transform pipeline
      const query = ctx.transformed[id]
      if (!query) { return }

      // Load file
      let code = loadFile(query)
      if (!code) { return }

      // Find format transformer
      const transformer = ctx.transformers[query.ext]
      if (!transformer) { return code }

      // Apply load transformers
      if (transformer?.loadTransformers?.length) {
        for (const transform of transformer.loadTransformers) {
          code = transform(code, query)
        }
      }

      // Try to find block via transformer loader
      const block = ctx.transformers[query.ext].loadBlock(code, query)

      // Return scoped contents
      return block || code
    },
  }
})

export default PinceauCorePlugin
