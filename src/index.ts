import { join } from 'path'
import defu from 'defu'
import { createUnplugin } from 'unplugin'
import { createContext } from './context'
import type { PinceauOptions } from './types'
import { registerAliases } from './utils/plugin'

export { defineTheme } from './theme'

const defaultOptions: PinceauOptions = {
  configFileName: 'pinceau.config',
  configOrPaths: [join(process.cwd(), 'pinceau.config')],
  configResolved: (_) => {},
  cwd: process.cwd(),
  outputDir: join(process.cwd(), 'node_modules/.vite/pinceau/'),
}

export default createUnplugin<PinceauOptions>(
  (options) => {
    options = defu(options, defaultOptions)

    const ctx = createContext(options)

    return {
      name: 'pinceau',

      enforce: 'pre',

      vite: {
        config(config) {
          registerAliases(config, options)
        },
        async configResolved(config) {
          await ctx.updateCwd(config.root)
        },
        async configureServer(server) {
          ctx.env = 'dev'

          await ctx.ready

          ctx.registerConfigWatchers(server)
        },
      },

      transformInclude() {
        // console.log({ id })
        return true
      },

      transform(code) {
        // console.log({ code })
        return code
      },

      resolveId(id) {
        if (id === 'pinceau.css') {
          return {
            id: join(options.outputDir as string, 'pinceau.css'),
            external: true,
          }
        }
      },
    }
  })
