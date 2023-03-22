import { createUnplugin } from 'unplugin'
import { join } from 'pathe'
import consola from 'consola'
import chalk from 'chalk'
import {
  usePinceauContext,
} from './theme'
import {
  transformCSS,
  transformCssFunction,
  transformDtHelper,
  transformStyleQuery,
  transformStyleTs,
  transformVueSFC,
  useTransformContext,
} from './transforms'
import {
  JS_EXTENSIONS,
  loadStyleBlock,
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
import type { PinceauTransformContext } from './types/transforms'

export const defaultOptions: PinceauOptions = {
  configFileName: 'tokens.config',
  configLayers: [],
  configResolved: (_) => {},
  configBuilt: (_) => {},
  cwd: process.cwd(),
  buildDir: join(process.cwd(), 'node_modules/.vite/pinceau/'),
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

  const pinceauContext = usePinceauContext(options)

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
        await pinceauContext.updateCwd(config.root)
      },
      async configureServer(server) {
        pinceauContext.env = 'dev'
        await pinceauContext.ready
        pinceauContext.viteServer = server
      },
      handleHotUpdate(hmrContext) {
        // Enforce <style lang="ts"> into <style lang="postcss">
        const defaultRead = hmrContext.read
        hmrContext.read = async function () {
          const code = await defaultRead()
          return transformStyleTs(code, undefined, true)
        }
      },
      transformIndexHtml: {
        order: 'post',
        handler(html) {
          // Vite replace Pinceau theme injection by actual content of `pinceau.css`

          // Support `<pinceau />`
          html = html.replace(
            '<pinceau />',
            `<style id="pinceau-theme">${pinceauContext.getOutput('/__pinceau_css.css')}</style>`,
          )

          // Support `<style id="pinceau-theme"></style>` (Slidev / index.html merging frameworks)
          html = html.replace(
            '<style id="pinceau-theme"></style>',
            `<style id="pinceau-theme">${pinceauContext.getOutput('/__pinceau_css.css')}</style>`,
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
      ) { toRet = false }

      // Run only on Nuxt loaded components
      if (
        toRet !== false
        && options.includes
        && options.includes.some(path => id.includes(path))
      ) { toRet = true }

      // Allow transformable files
      if (toRet !== false && query?.transformable) { toRet = true }

      // Push included file into context
      if (toRet) { pinceauContext.addTransformed(id) }

      return toRet
    },

    transform(code, id) {
      if (!code) { return }

      const query = parsePinceauQuery(id)

      code = transformStyleTs(code, query)

      const transformContext: PinceauTransformContext = useTransformContext(code, query, pinceauContext)

      try {
        // Handle $dt in JS(X)/TS(X) files
        if (JS_EXTENSIONS.includes(query.ext)) {
          transformDtHelper(transformContext, pinceauContext)
          return transformContext.result()
        }

        // Handle CSS files & <style> tags scoped queries
        if ((query.styles && !query.vue) || query.type === 'style') {
          transformStyleQuery(transformContext, pinceauContext)
          return transformContext.result()
        }

        // Transform Vue
        transformVueSFC(transformContext, pinceauContext)
      }
      catch (e) {
        message('TRANSFORM_ERROR', [id, e])
        console.log({ e })
        return { code }
      }

      return transformContext.result()
    },

    resolveId(id: string) {
      return pinceauContext.getOutputId(id)
    },

    load(id) {
      // Performance timings
      const { stopPerfTimer } = useDebugPerformance(`Load ${id}`, options.debug)

      // Check if id refers to local output
      const output = pinceauContext.getOutput(id)
      if (output) {
        stopPerfTimer()
        return { code: output }
      }

      // Parse query
      const query = parsePinceauQuery(id)

      // Transform Vue scoped query
      if (query.vue && query.type === 'style') {
        const styleBlock = loadStyleBlock(query)

        if (styleBlock) {
          const transformContext = useTransformContext(styleBlock.content, query, pinceauContext)

          if (styleBlock.attrs.lang === 'ts' || styleBlock.lang === 'ts' || styleBlock.attrs?.transformed) { transformCssFunction(transformContext, pinceauContext) }
          transformCSS(transformContext, pinceauContext)

          return transformContext.result()
        }
      }

      stopPerfTimer()
    },
  }
})
