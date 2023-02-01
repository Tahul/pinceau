import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { join } from 'pathe'
import consola from 'consola'
import chalk from 'chalk'
import { usePinceauContext } from './theme/context'
import { registerAliases, registerPostCssPlugins } from './utils/plugin'
import { replaceStyleTs, resolveStyleQuery, transformVueSFC, transformVueStyle } from './transforms'
import { parseVueQuery } from './utils/query'
import { message, updateDebugContext } from './utils/logger'
import type { PinceauOptions } from './types'
import { merger } from './utils/merger'
import { useDebugPerformance } from './utils/debug'
import { outputFileNames } from './utils'
import { transformDtHelper } from './transforms/dt'

export const defaultOptions: PinceauOptions = {
  configFileName: 'tokens.config',
  configLayers: [],
  configResolved: (_) => {},
  configBuilt: (_) => {},
  cwd: process.cwd(),
  outputDir: join(process.cwd(), 'node_modules/.vite/pinceau/'),
  preflight: true,
  includes: [],
  excludes: [
    'node_modules/nuxt/dist/',
    'node_modules/@nuxt/ui-templates/',
    'node_modules/@vue/',
    'node_modules/pinceau/',
    ...outputFileNames,
  ],
  followSymbolicLinks: true,
  colorSchemeMode: 'media',
  debug: false,
  componentMetaSupport: false,
  runtime: true,
  definitions: true,
  studio: false,
  utilsImports: [],
}

export default createUnplugin<PinceauOptions>(
  (options) => {
    options = merger(options, defaultOptions)

    // Setup debug context if in development
    const { stopPerfTimer } = useDebugPerformance('Setup Unplugin', options?.debug)
    updateDebugContext({
      debugLevel: options?.dev ? options.debug : false,
      logger: consola.withScope(' 🖌 '),
      // chalk.bgBlue.blue
      tag: value => chalk.bgBlue.blue(value),
      // chalk.blue
      info: value => chalk.blue(value),
      // chalk.yellow
      warning: value => chalk.yellow(value),
      // chalk.red
      error: value => chalk.red(value),
    })

    const ctx = usePinceauContext(options)

    stopPerfTimer()

    return {
      name: 'pinceau-transforms',

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
          ctx.env = 'dev'
          await ctx.ready
          ctx.setViteServer(server)
        },
        handleHotUpdate(ctx) {
          // Enforce <style lang="ts"> into <style lang="postcss">
          const defaultRead = ctx.read
          ctx.read = async function () {
            const code = await defaultRead()
            return replaceStyleTs(code, ctx.file) || code
          }
        },
        transformIndexHtml: {
          order: 'post',
          handler(html) {
            // Vite replace Pinceau theme injection by actual content of `pinceau.css`

            // Support `<pinceau />`
            html = html.replace('<pinceau />', `<style id="pinceau-theme">${ctx.getOutput('/__pinceau_css.css')}</style>`)

            // Support `<style id="pinceau-theme"></style>` (Slidev / index.html merging frameworks)
            html = html.replace('<style id="pinceau-theme"></style>', `<style id="pinceau-theme">${ctx.getOutput('/__pinceau_css.css')}</style>`)

            return html
          },
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
        const magicString = new MagicString(code || '', { filename: query.filename })
        const result = (code = magicString.toString(), ms = magicString) => {
          stopPerfTimer()
          return { code, map: ms.generateMap({ source: id, includeContent: true }) }
        }
        const missingMap = (code: string) => {
          stopPerfTimer()
          const magicStringLength = magicString?.length?.() || magicString?.toString?.()?.length
          if (magicStringLength) { magicString.overwrite(0, magicStringLength, '') }
          magicString.append(code)
          return { code, map: magicString.generateMap({ source: id, includeContent: true }) }
        }

        try {
          // Handle $dt in JS(X)/TS(X) files
          if (['js', 'ts', 'jsx', 'mjs', 'tsx', 'jsx', 'tsx'].includes(query.ext)) {
            return missingMap(transformDtHelper(code, ctx))
          }

          // Handle CSS files & <style> tags scoped queries
          const loc = { query, source: code }
          if ((query.css && !query.vue) || query.type === 'style') {
            return missingMap(resolveStyleQuery(code, magicString, query, ctx, loc).code)
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
          return {
            code: vueStyle || '',
            map: new MagicString(vueStyle || '', { filename: query.filename }).generateMap({ file: query.filename, includeContent: true }),
          }
        }
      },
    }
  })
