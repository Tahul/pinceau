import process from 'node:process'
import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { join } from 'pathe'
import consola from 'consola'
import chalk from 'chalk'
import {
  usePinceauContext,
} from './theme'
import {
  replaceStyleTs,
  resolveStyleQuery,
  transformDtHelper,
  transformVueSFC,
} from './transforms'
import {
  JS_EXTENSIONS,
  loadVueStyle,
  merger,
  message,
  outputFileNames,
  parsePinceauQuery,
  registerAliases,
  registerPostCssPlugins,
  updateDebugContext,
  useDebugPerformance,
} from './utils'
import type { PinceauOptions } from './types'

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
  dev: process.env.NODE_ENV !== 'production',
  utilsImports: [],
}

export default createUnplugin<PinceauOptions>((options) => {
  options = merger(options, defaultOptions)

  // Setup debug context if in development
  const { stopPerfTimer } = useDebugPerformance('Setup Unplugin', options?.debug)
  updateDebugContext({
    debugLevel: options?.dev ? options.debug : false,
    logger: consola.withTag(' 🖌 '),
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
          html = html.replace(
            '<pinceau />',
            `<style id="pinceau-theme">${ctx.getOutput(
              '/__pinceau_css.css',
            )}</style>`,
          )

          // Support `<style id="pinceau-theme"></style>` (Slidev / index.html merging frameworks)
          html = html.replace(
            '<style id="pinceau-theme"></style>',
            `<style id="pinceau-theme">${ctx.getOutput(
              '/__pinceau_css.css',
            )}</style>`,
          )

          return html
        },
      },
    },

    transformInclude(id) {
      let toRet

      // Use Vue's query parser
      const query = parsePinceauQuery(id)

      // Stop on excluded paths
      if (
        options.excludes
        && options.excludes.some(path => id.includes(path))
      ) {
        toRet = false
      }

      // Run only on Nuxt loaded components
      if (
        toRet !== false
        && options.includes
        && options.includes.some(path => id.includes(path))
      ) {
        toRet = true
      }

      // Allow transformable files
      if (toRet !== false && query?.transformable) {
        toRet = true
      }

      // Push included file into context
      if (toRet) {
        ctx.addTransformed(id)
      }

      return toRet
    },

    transform(code, id) {
      // Skip empty
      if (!code) { return }

      // Performance timings
      const { stopPerfTimer } = useDebugPerformance(
        `Transforming ${id}`,
        options.debug,
      )

      // Enforce <style lang="ts"> into <style lang="postcss">
      code = replaceStyleTs(code, id)

      // Parse query
      const query = parsePinceauQuery(id)

      // Create location object
      const loc = { query, source: code }

      // Create magic string from query and code
      const magicString = new MagicString(code, { filename: query.filename })

      /**
       * Returns code and MagicString result.
       */
      const result = () => {
        stopPerfTimer()
        const sourceMap = magicString.generateMap()
        sourceMap.file = query.filename
        sourceMap.sources = [query.filename]
        return { code: magicString.toString(), map: sourceMap }
      }

      try {
        // Handle $dt in JS(X)/TS(X) files
        if (JS_EXTENSIONS.includes(query.ext)) {
          const transformedCode = transformDtHelper(code, ctx)
          magicString.overwrite(0, code.length, transformedCode)
          const sourceMap = magicString.generateMap({ file: query.filename, includeContent: true })
          sourceMap.file = query.filename
          sourceMap.sources = [query.filename]

          return { code: transformedCode, map: sourceMap }
        }

        // Handle CSS files & <style> tags scoped queries
        if ((query.styles && !query.vue) || query.type === 'style') {
          const transformedCode = resolveStyleQuery(code, magicString, query, ctx, loc).code
          magicString.overwrite(0, code.length, transformedCode)
          const sourceMap = magicString.generateMap({ file: query.filename, includeContent: true })
          sourceMap.file = query.filename
          sourceMap.sources = [query.filename]
          return { code: transformedCode, map: sourceMap }
        }

        // Transform Vue
        code = transformVueSFC(code, query, magicString, ctx).code
      }
      catch (e) {
        message('TRANSFORM_ERROR', [id, e])
        const sourceMap = magicString.generateMap()
        sourceMap.file = query.filename
        sourceMap.sources = [query.filename]
        return { code, map: sourceMap }
      }

      return result()
    },

    resolveId(id) {
      return ctx.getOutputId(id)
    },

    load(id) {
      // Performance timings
      const { stopPerfTimer } = useDebugPerformance(
        `Load ${id}`,
        options.debug,
      )

      // Check if id refers to local output
      const output = ctx.getOutput(id)
      if (output) {
        stopPerfTimer()
        return output
      }

      // Parse query
      const query = parsePinceauQuery(id)

      // Transform Vue scoped query
      if (query.vue && query.type === 'style') {
        const vueStyle = loadVueStyle(query, ctx)

        if (vueStyle) {
          // Create MagicString for this local transform
          const sourceMap = new MagicString(vueStyle, {
            filename: query.filename,
          }).generateMap({ file: query.filename, includeContent: true })
          sourceMap.sources = [query.filename]
          sourceMap.file = query.filename

          stopPerfTimer()

          return {
            code: vueStyle,
            map: sourceMap,
          }
        }
      }

      stopPerfTimer()
    },
  }
})
