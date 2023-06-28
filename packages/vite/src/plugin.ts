import chalk from 'chalk'
import type { PinceauOptions } from '@pinceau/shared'
import { defaultOptions, merger, registerPostCssPlugins, updateDebugContext } from '@pinceau/shared'
import { usePinceauContext } from '@pinceau/theme'
import { consola } from 'consola'
import { createUnplugin } from 'unplugin'

export default createUnplugin<PinceauOptions>((options) => {
  options = merger(options, defaultOptions)

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

  return [
    // Core
    {
      name: 'pinceau:core',

      enforce: 'pre',

      vite: {
        config(config) {
          registerPostCssPlugins(config, options)
        },
        async configResolved(config) {
          await ctx.updateCwd(config.root)
        },
        async configureServer(server) {
          // PinceauContext setup
          ctx.env = 'dev'
          await ctx.ready
          ctx.updateViteServer(server)

          // PinceauContext injection
          ;(server as any)._pinceauContext = ctx
        },
      },

      resolveId(id) {
        return ctx.getOutputId(id)
      },

      load(id) {
        const output = ctx.getOutput(id)
        if (output) {
          console.log({ id, output })
          return output
        }
      },
    },
  ]
})
