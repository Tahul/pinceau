import { createUnplugin } from 'unplugin'
import chalk from 'chalk'
import { consola } from 'consola'
import type { PinceauOptions } from './types'
import { updateDebugContext } from './debug'
import { registerPostCSSPlugins } from './postcss'
import { usePinceauContext } from './context'

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
    name: 'pinceau:core',

    enforce: 'pre',

    vite: {
      config(config) {
        registerPostCSSPlugins(config, ctx.options)
      },
      async configureServer(server) {
        // PinceauContext setup
        ctx.options.dev = true
        ctx.updateViteServer(server)

        // PinceauContext injection
        ;(server as any)._pinceauContext = ctx
      },
    },

    resolveId(id) {
      return ctx.getOutputId(id)
    },

    /**
     * Global transform include check; Pinceau plugins will access this via `ctx.transformed`
     */
    transformInclude(id) {
      const query = ctx.isTransformable(id)

      let toRet

      // Allow transformable files
      if (query && query?.transformable) { toRet = true }

      // Push included file into context
      if (toRet && query) { ctx.addTransformed(id, query) }

      return toRet
    },

    transform(code) {
      return code
    },

    /**
     * Global load include check; Pinceau plugins will access this via `ctx.loaded`
     */
    loadInclude(id) {
      const query = ctx.isLoadable(id)

      let toRet

      // Allow transformable files
      if (query && query?.transformable) { toRet = true }

      // Push included file into context
      if (toRet && query) { ctx.addLoaded(id, query) }

      return toRet
    },

    load(id) {
      const output = ctx.getOutput(id)
      if (output) { return output }
    },
  }
})

export default PinceauCorePlugin
