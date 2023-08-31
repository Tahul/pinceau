import type { UnpluginInstance } from 'unplugin'
import { createUnplugin } from 'unplugin'
import chalk from 'chalk'
import { consola } from 'consola'
import type { PinceauUserOptions } from './types'
import { updateDebugContext } from './utils/debug'
import { registerPostCSSPlugins } from './utils/postcss'
import { usePinceauContext } from './utils/core-context'
import { load, loadInclude } from './utils/unplugin'

const PinceauCorePlugin: UnpluginInstance<PinceauUserOptions> = createUnplugin((options) => {
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
      configResolved(config) {
        if (!ctx.options.cwd) { ctx.options.cwd = config.root }
      },
      api: {
        getPinceauContext: () => ctx,
      },
      configureServer(server) {
        // As server exists, we most likely are in development mode.
        ctx.options.dev = true
        ctx.devServer = server
      },
      handleHotUpdate(hmrContext) {
        const defaultRead = hmrContext.read

        // Enforce load transformers even on HMR.
        hmrContext.read = async function () {
          let code = await defaultRead()

          const query = ctx.transformed[hmrContext.file]

          if (query) { code = ctx.applyTransformers(query, code) }

          return code
        }
      },
    },

    resolveId: id => ctx.getOutputId(id),

    /**
     * Global load include check; Pinceau plugins will access this via `ctx.transformed`
     */
    loadInclude: id => loadInclude(id, ctx),

    /**
     * Global load block; handles virtual storage assets and load transfomers and block loaders.
     */
    load: id => load(id, ctx),
  }
})

export default PinceauCorePlugin
