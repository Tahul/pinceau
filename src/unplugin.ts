import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { join } from 'pathe'
import { createContext } from './theme'
import { registerAliases, registerPostCssPlugins } from './utils/plugin'
import { replaceStyleTs, resolveStyleQuery, transformVueSFC, transformVueStyle } from './transforms'
import { parseVueQuery } from './utils/query'
import { setDebugLevel, message } from './utils/logger'
import type { PinceauOptions } from './types'
import { merger } from './utils/merger'
import { useDebugPerformance } from './utils/debug'

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
    'node_modules/@nuxt/ui-templates/',
    'node_modules/@vue/',
    'node_modules/pinceau/',
    '/__pinceau_css.css',
    '/__pinceau_ts.ts',
    '/__pinceau_js.js',
    '/__pinceau_flat_ts.ts',
    '/__pinceau_flat_js.js',
  ],
  followSymbolicLinks: true,
  colorSchemeMode: 'media',
  debug: false,
  componentMetaSupport: false,
}

export default createUnplugin<PinceauOptions>(
  (options) => {
    const { stopPerfTimer } = useDebugPerformance('Setup Unplugin', options.debug)

    options = merger(options, defaultOptions)

    setDebugLevel(options.debug)

    const ctx = createContext(options)

    stopPerfTimer()

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
        },
        handleHotUpdate(ctx) {
          // Enforce <style lang="ts"> into <style lang="postcss">
          const defaultRead = ctx.read
          ctx.read = async function () {
            const code = await defaultRead()
            return replaceStyleTs(code, ctx.file) || code
          }
        },
      },

      transformInclude(id) {
        let toRet

        // Use Vue's query parser
        const query = parseVueQuery(id)

        // Stop on excluded paths
        if (options.excludes && options.excludes.some(path => id.includes(path))) { toRet = false }

        // Run only on Nuxt loaded components
        if (toRet !== false && options.includes && options.includes.some(path => id.includes(path))) { toRet = true }

        // Allow Vue & CSS files
        if (toRet !== false && (query?.vue || query?.css)) { toRet = true }

        // Push included file into context
        if (toRet) { ctx.addTransformed(id) }

        return toRet
      },

      transform(code, id) {
        // Performance timings
        const { stopPerfTimer } = useDebugPerformance(`Transforming ${id}`, options.debug)

        // Enforce <style lang="ts"> into <style lang="postcss">
        code = replaceStyleTs(code, id)

        // Parse query
        const query = parseVueQuery(id)

        // Create magic string from query and code
        const magicString = new MagicString(code, { filename: query.filename })
        const result = (code = magicString.toString(), ms = magicString) => {
          stopPerfTimer()
          return { code, map: ms.generateMap({ source: id, includeContent: true }) }
        }
        const missingMap = (code: string) => {
          stopPerfTimer()
          return { code, map: new MagicString(code, { filename: query.filename }).generateMap() }
        }

        try {
          // Handle CSS files
          const loc = { query, source: code }
          if (query.css && !query.vue) {
            const { code: _code } = resolveStyleQuery(code, magicString, query, ctx, loc)
            return missingMap(_code)
          }

          // Handle <style> tags scoped queries
          if (query.type === 'style') {
            const { code: _code } = resolveStyleQuery(code, magicString, query, ctx, loc)
            return missingMap(_code)
          }

          // Return early when the query is scoped (usually style tags)
          const { code: _code } = transformVueSFC(code, query, magicString, ctx)
          code = _code
        }
        catch (e) {
          message('TRANSFORM_ERROR', [id, e])
          return missingMap(code)
        }

        return result()
      },

      resolveId(id) {
        return ctx.getOutputId(id)
      },

      load(id) {
        // Performance timings
        const { stopPerfTimer } = useDebugPerformance(`Load ${id}`, options.debug)

        // Check if id refers to local output
        const output = ctx.getOutput(id)
        if (output) {
          stopPerfTimer()
          return output
        }

        // Parse query
        const query = parseVueQuery(id)

        // Transform Vue scoped query
        if (query.vue && query.type === 'style') {
          const vueStyle = transformVueStyle(query, ctx)
          stopPerfTimer()
          return vueStyle
        }
      },
    }
  })
