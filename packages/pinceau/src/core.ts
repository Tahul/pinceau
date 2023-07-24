import type { PinceauContext } from '@pinceau/shared'
import { createUnplugin } from 'unplugin'
import { registerPostCSSPlugins } from './postcss'

const PinceauCorePlugin = createUnplugin<PinceauContext>((ctx) => {
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
      if (toRet) { ctx.addTransformed(id, query) }
      else { ctx.addTransformed(id) }

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
      if (toRet) { ctx.addLoaded(id, query) }
      else { ctx.addLoaded(id) }

      return toRet
    },

    load(id) {
      const output = ctx.getOutput(id)
      if (output) { return output }
    },
  }
})

export default PinceauCorePlugin
