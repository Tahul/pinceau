import { existsSync } from 'node:fs'
import { join, resolve } from 'pathe'
import { addPlugin, addPluginTemplate, createResolver, defineNuxtModule, resolveAlias, resolveModule } from '@nuxt/kit'
import createJITI from 'jiti'
import type { ConfigLayer, PinceauOptions } from './types'
import pinceau, { defaultOptions } from './unplugin'
import { prepareOutputDir } from './theme/output'
import { useDebugPerformance } from './utils/debug'
import { walkTokens } from './utils'

const module: any = defineNuxtModule<PinceauOptions>({
  meta: {
    name: 'pinceau/nuxt',
    configKey: 'pinceau',
  },
  defaults: nuxt => ({
    ...defaultOptions,
    colorSchemeMode: 'class',
    outputDir: join(nuxt.options.buildDir, 'pinceau/'),
  }),
  async setup(options: PinceauOptions, nuxt) {
    options.dev = nuxt.options?.dev || process.env.NODE_ENV !== 'production'
    const { stopPerfTimer } = useDebugPerformance('Setup Nuxt module', options.debug)

    // Local module resolver
    const modulePath = createResolver(import.meta.url)
    const resolveLocalModule = (path: string) => resolveModule(path, { paths: modulePath.resolve('./') })

    // Transpile pinceau
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push('pinceau', 'chroma-js')

    // Set `cwd` from Nuxt rootDir
    options.cwd = nuxt.options.rootDir

    // nuxt-component-meta support
    if (options.componentMetaSupport) {
      const cachedTokens = []

      // @ts-ignore
      nuxt.hook('component-meta:transformers', (transformers: any[]) => {
        transformers.push(
          (component, code) => {
            const resolvedTokens = []

            // Grab built tokens and resolve all tokens paths
            if (!cachedTokens && existsSync(join(options.outputDir, 'index.ts'))) {
              const _tokens = createJITI(options.outputDir)(join(options.outputDir, 'index.ts')).default
              walkTokens(_tokens?.theme || _tokens, (_, __, paths) => cachedTokens.push(paths.join('.')))
            }

            // Parse tokens in component code
            if (cachedTokens.length) {
              const referencesRegex = /\{([a-zA-Z].+)\}/g
              const matches: any = code.match(referencesRegex) || []

              matches.forEach(
                (match) => {
                  const _match = match.replace('{', '').replace('}', '')
                  if (cachedTokens.includes(_match) && !resolvedTokens.includes(_match)) { resolvedTokens.push(match) }
                },
              )
            }

            component.meta.tokens = resolvedTokens

            return { component, code }
          },
        )

        return transformers
      })
    }

    // Automatically inject generated types to tsconfig
    nuxt.hook('prepare:types', async (opts) => {
      const tsConfig: typeof opts.tsConfig & { vueCompilerOptions?: any } = opts.tsConfig
      tsConfig.compilerOptions = tsConfig.compilerOptions || {}
      tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {}

      if (options?.outputDir) {
        tsConfig.compilerOptions.paths['#pinceau/utils'] = [`${resolve(options.outputDir, 'utils.ts')}`]
        tsConfig.compilerOptions.paths['#pinceau/theme'] = [`${resolve(options.outputDir, 'index.ts')}`]
        if (options?.studio) { tsConfig.compilerOptions.paths['#pinceau/schema'] = [`${resolve(options.outputDir, 'schema.ts')}`] }
        if (options?.definitions) { tsConfig.compilerOptions.paths['#pinceau/definitions'] = [`${resolve(options.outputDir, 'definitions.ts')}`] }
      }

      // Push Pinceau reference
      opts.references.push({ path: 'pinceau' })
      opts.references.push({ path: 'pinceau/runtime' })

      // Add Volar plugin
      tsConfig.vueCompilerOptions = tsConfig.vueCompilerOptions || {}
      tsConfig.vueCompilerOptions.plugins = tsConfig.vueCompilerOptions.plugins || []
      tsConfig.vueCompilerOptions.plugins.push('pinceau/volar')

      // Prepares the output dir
      await prepareOutputDir(options)
    })

    // Setup Nitro plugin
    if (nuxt.options.ssr) {
      if (!nuxt.options.nitro) { nuxt.options.nitro = {} }
      const nitroConfig = nuxt.options.nitro
      nitroConfig.plugins = nitroConfig.plugins || []
      nitroConfig.plugins.push(resolveLocalModule('./nitro'))
      nitroConfig.externals = nitroConfig.externals || {}
      nitroConfig.externals.inline = nitroConfig.externals.inline || []
      nitroConfig.externals.inline.push(resolveLocalModule('./nitro'))
    }
    else {
      nuxt.options.css = nuxt.options.css || []
      nuxt.options.css.push(join(options.outputDir, 'theme/index.css'))
    }

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.bundledStorage = nitroConfig.bundledStorage || []
      nitroConfig.bundledStorage.push('pinceau')

      nitroConfig.devStorage = nitroConfig.devStorage || {}
      nitroConfig.devStorage.pinceau = {
        driver: 'fs',
        base: join(options.outputDir!, 'theme'),
      }
    })

    // Support for `extends` feature
    // Will scan each layer for a config file
    options.configLayers = [
      ...options?.configLayers,
      ...nuxt.options._layers.reduce(
        (acc: ConfigLayer[], layer: any) => {
          if (typeof layer === 'string') { acc.push({ cwd: layer, configFileName: options.configFileName }) }
          if (layer?.cwd) { acc.push({ cwd: layer?.cwd, configFileName: options.configFileName }) }
          return acc
        },
        [],
      ),
    ]

    // Call options hook
    await nuxt.callHook('pinceau:options', options)

    // Pinceau runtime config (to be used with Nuxt Studio integration)
    nuxt.options.runtimeConfig.pinceau = { studio: options?.studio, outputDir: options?.outputDir }

    // Setup Nuxt Studio support
    if (options.studio) {
      // Add server route to know Studio is enabled
      addPlugin(resolveLocalModule('./runtime/schema.server'))

      // Push Studio config file has highest priority
      const studioAppConfigPath = resolveAlias('~/.studio')
      if (existsSync(studioAppConfigPath)) { options.configLayers.unshift({ cwd: studioAppConfigPath, configFileName: 'tokens.config' }) }
    }

    addPluginTemplate({
      filename: 'pinceau-nuxt-plugin.server.mjs',
      mode: 'server',
      getContents() {
        const lines = []

        // Support runtime features
        if (options.runtime) {
          lines.push(
            'import { dirname, join } from \'pathe\'',
            'import { useRuntimeConfig } from \'#imports\'',
            'import { plugin as pinceau } from \'pinceau/runtime\'',
            'import utils from \'#build/pinceau/utils\'',
            'import theme from \'#build/pinceau/index\'',
            '',
            `export default defineNuxtPlugin(async (nuxtApp) => {
              nuxtApp.vueApp.use(pinceau, { colorSchemeMode: '${options.colorSchemeMode}', theme, utils })

              const { pinceau: runtimeConfig } = useRuntimeConfig()

              // Handle first render of SSR styles
              nuxtApp.hook('app:rendered', async (app) => {
                app.ssrContext.event.pinceauContent = app.ssrContext.event.pinceauContent || {}
                const content = app.ssrContext.nuxt.vueApp.config.globalProperties.$pinceauSsr.get()
                app.ssrContext.event.pinceauContent.runtime = content
              })
            })`,
          )
        }

        // Support any reset from @unocss/reset
        if (options?.preflight) { lines.unshift(`import \'@unocss/reset/${typeof options.preflight === 'boolean' ? 'tailwind' : options.preflight}.css\'`) }

        return lines.join('\n')
      },
    })

    addPluginTemplate({
      filename: 'pinceau-nuxt-plugin.client.mjs',
      mode: 'client',
      getContents() {
        const lines = []

        if (options.runtime) {
          lines.push(
            'import { plugin as pinceau } from \'pinceau/runtime\'',
            'import utils from \'#build/pinceau/utils\'',
            `export default defineNuxtPlugin(async (nuxtApp) => nuxtApp.vueApp.use(pinceau, { colorSchemeMode: '${options.colorSchemeMode}', utils }))`,
          )
        }
        else {
          lines.push(
            'import \'pinceau.css\'',
            'export default defineNuxtPlugin(() => {})',
          )
        }

        // Support any reset from @unocss/reset
        if (options?.preflight) { lines.unshift(`import \'@unocss/reset/${typeof options.preflight === 'boolean' ? 'tailwind' : options.preflight === 'sanitize' ? 'sanitize/sanitize' : options.preflight}.css\'`) }

        return lines.join('\n')
      },
    })

    // Vite plugin
    nuxt.hook('vite:extend', (vite: any) => {
      vite.config.plugins = vite.config.plugins || []
      vite.config.plugins.push(pinceau.vite(options))
    })

    stopPerfTimer()
  },
})

export default module
