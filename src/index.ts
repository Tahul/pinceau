import { join } from 'path'
import defu from 'defu'
import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { createContext } from './context'
import type { PinceauOptions } from './types'
import { registerAliases } from './utils/plugin'
import { replaceStyleTs, resolveVueComponents } from './transforms'
import { parseVueRequest } from './utils/vue'

export { defineTheme } from './theme'
export { get } from './utils'

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
          registerAliases(config)
        },
        async configResolved(config) {
          await ctx.updateCwd(config.root)
        },
        async configureServer(server) {
          ctx.setViteServer(server)
          ctx.env = 'dev'
          await ctx.ready
          ctx.registerConfigWatchers(server)
        },
        handleHotUpdate(ctx) {
          const defaultRead = ctx.read
          ctx.read = async function () {
            const code = await defaultRead()
            return replaceStyleTs(code, ctx.file) || code
          }
        },
      },

      transformInclude(id) {
        // Use Vue's query parser
        const { query } = parseVueRequest(id)
        if (query?.vue) { return true }
      },

      transform(code, id) {
        code = replaceStyleTs(code, id)

        const { filename, query } = parseVueRequest(id)

        // Create sourceMap compatible string
        const magicString = new MagicString(code, { filename })
        const result = () => ({ code: magicString.toString(), map: magicString.generateMap({ source: id, includeContent: true }) })

        if (query?.vue) {
          // Return early when the query is scoped (usually style tags)
          const { code: _code, early } = resolveVueComponents(code, id, magicString, ctx, query)
          if (early) { return _code }
        }

        return result()
      },

      resolveId(id) {
        return ctx.getOutputId(id)
      },

      load(id) {
        const output = ctx.getOutput(id)
        if (output) {
          return output
        }
      },
    }
  })
