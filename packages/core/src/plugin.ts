import fs from 'node:fs'
import { createRequire } from 'node:module'
import type { UnpluginInstance } from 'unplugin'
import { createUnplugin } from 'unplugin'
import chalk from 'chalk'
import { consola } from 'consola'
import type { PinceauUserOptions } from './types/options'
import { updateDebugContext } from './utils/debug'
import { usePinceauContext } from './utils/core-context'
import { load, loadInclude, resolveId } from './utils/unplugin'

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
        if (!config.server) { config.server = {} }
        if (!config.server.watch) { config.server.watch = {} }
        if (!config.server.watch.ignored) { config.server.watch.ignored = [] }
        (config.server.watch.ignored as any).push('@pinceau/outputs')
      },
      configResolved(config) {
        if (!ctx.options.cwd) {
          ctx.options.cwd = config.root
        }

        // Set node dependencies
        ctx.fs = fs
        ctx.resolve = createRequire(!ctx.options.cwd.endsWith('/') ? `${ctx.options.cwd}/` : ctx.options.cwd).resolve
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

        // Enforce HMR js-update event when changing the content of a transformed block.
        const transformedContent = hmrContext.modules.filter(mod => mod?.id?.includes('pctransformed'))
        if (transformedContent) {
          transformedContent.forEach((node) => {
            const componentPath = node.url.split('?')[0]

            hmrContext.server.ws.send({
              type: 'update',
              updates: [
                {
                  type: 'js-update',
                  timestamp: Date.now() + 2,
                  acceptedPath: componentPath,
                  path: componentPath,
                  explicitImportRequired: false,
                },
              ],
            })
          })
        }
      },
    },

    resolveId: id => resolveId(id, ctx),

    /**
     * Global load include check; Pinceau plugins will access this via `ctx.transformed`
     */
    loadInclude: id => loadInclude(id, ctx),

    /**
     * Global load block; handles virtual storage assets and load transfomers and block loaders.
     */
    load: async id => await load(id, ctx),
  }
})

export default PinceauCorePlugin
