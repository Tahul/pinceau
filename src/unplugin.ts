import { defu } from 'defu'
import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { parse } from '@vue/compiler-sfc'
import { join } from 'pathe'
import { createContext } from './theme'
import { registerAliases, registerPostCssPlugins } from './utils/plugin'
import { replaceStyleTs, transformVueSFC, transformVueStyle } from './transforms'
import { parseVueQuery } from './utils/query'
import { logger } from './utils/logger'
import type { PinceauOptions } from './types'

export const defaultOptions: PinceauOptions = {
  configFileName: 'pinceau.config',
  configOrPaths: [process.cwd()],
  configResolved: (_) => {},
  cwd: process.cwd(),
  outputDir: join(process.cwd(), 'node_modules/.vite/pinceau/'),
  preflight: true,
  includes: [],
  excludes: [
    'node_modules/nuxt/dist/',
    'node_modules/@vue/',
    'node_modules/pinceau/',
  ],
  followSymbolicLinks: true,
  colorSchemeMode: 'class',
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
          registerPostCssPlugins(config, options)
        },
        async configResolved(config) {
          await ctx.updateCwd(config.root)
        },
        async configureServer(server) {
          ctx.setViteServer(server)
          ctx.env = 'dev'
          await ctx.ready
          process.setMaxListeners(0)
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
        const query = parseVueQuery(id)

        // Stop on excluded paths.
        if (options.excludes && options.excludes.some(path => id.includes(path))) { return false }

        // // Run only on Nuxt loaded components
        if (options.includes && options.includes.some(path => id.includes(path))) { return true }

        if (query?.vue) { return true }
      },

      transform(code, id) {
        code = replaceStyleTs(code, id)

        const query = parseVueQuery(id)

        const magicString = new MagicString(code, { filename: query.filename })
        const result = () => ({ code: magicString.toString(), map: magicString.generateMap({ source: id, includeContent: true }) })
        const missingMap = (code: string) => ({ code, map: new MagicString(code, { filename: query.filename }).generateMap() })

        try {
          // Return early when the query is scoped (usually style tags)
          const { code: _code, early } = transformVueSFC(code, id, magicString, ctx, query)
          if (early) { return missingMap(_code) }
        }
        catch (e) {
          logger.error(`Could not transform file ${query.filename || id}`)
          logger.error(e)
          return missingMap(code)
        }

        // Parse the component code to check if it is a valid Vue SFC
        if (query?.vue) {
          try {
            parse(result().code)
          }
          catch (e) {
            // Return code w/o transforms when parsing fails
            return missingMap(code)
          }
        }

        return result()
      },

      resolveId(id) {
        return ctx.getOutputId(id)
      },

      load(id) {
        // Check if id refers to local output
        const output = ctx.getOutput(id)
        if (output) {
          return output
        }

        const query = parseVueQuery(id)

        if (query.vue && query.type === 'style') {
          return transformVueStyle(id, query, ctx)
        }
      },
    }
  })
