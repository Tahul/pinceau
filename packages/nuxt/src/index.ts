import { existsSync } from 'node:fs'
import process from 'node:process'
import { join, resolve } from 'pathe'
import { addPlugin, addPluginTemplate, addPrerenderRoutes, createResolver, defineNuxtModule, resolveAlias, resolveModule } from '@nuxt/kit'
import createJITI from 'jiti'
import type { ConfigLayer, PinceauUserOptions } from '@pinceau/shared'
import { prepareBuildDir } from '@pinceau/theme'
import { defaultOptions, normalizeOptions, walkTokens } from '@pinceau/shared'

export interface ModuleHooks {
  'pinceau:options': (options: PinceauUserOptions) => void | Promise<void>
}
export interface ModuleOptions extends PinceauUserOptions { }

const module: any = defineNuxtModule<PinceauUserOptions>({
  meta: {
    name: '@pinceau/nuxt',
    configKey: 'pinceau',
  },
  defaults: nuxt => ({
    ...defaultOptions,
    colorSchemeMode: 'class',
    buildDir: join(nuxt.options.buildDir, 'pinceau/'),
  }),
  async setup(_options, nuxt) {
    // Normalize options as soon as module gets loaded.
    const options = normalizeOptions(_options)

    const buildDir: string = options?.theme?.buildDir as string
    options.dev = nuxt.options?.dev || process.env.NODE_ENV !== 'production'

    // Local module resolver
    const modulePath = createResolver(import.meta.url)
    const resolveLocalModule = (path: string) => resolveModule(path, { paths: modulePath.resolve('./') })

    // Transpile pinceau
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push('pinceau', 'chroma-js')

    // Set `cwd` from Nuxt rootDir
    options.cwd = nuxt.options.rootDir

    // nuxt-component-meta support
    if (options?.theme?.componentMeta) {
      const cachedTokens: string[] = []

      // @ts-ignore
      nuxt.hook('component-meta:transformers', (transformers: any[]) => {
        transformers.push(
          (component: any, code: string) => {
            const resolvedTokens: string[] = []

            // Grab built tokens and resolve all tokens paths
            if (existsSync(join(buildDir, 'index.ts'))) {
              const _tokens = createJITI(buildDir)(join(buildDir, 'index.ts')).default
              walkTokens(_tokens?.theme || _tokens, (_, __, paths) => cachedTokens.push(paths.join('.')))
            }

            // Parse tokens in component code
            if (cachedTokens.length) {
              const referencesRegex = /\{([a-zA-Z].+)\}/g
              const matches: any = code.match(referencesRegex) || []
              matches.forEach(
                (match: string) => {
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

      if (options.theme.buildDir) {
        tsConfig.compilerOptions.paths['#pinceau/utils'] = [`${resolve(options.theme.buildDir, 'utils.ts')}`]
        tsConfig.compilerOptions.paths['#pinceau/theme'] = [`${resolve(options.theme.buildDir, 'index.ts')}`]
        if (options.theme.studio) { tsConfig.compilerOptions.paths['#pinceau/schema'] = [`${resolve(options.theme.buildDir, 'schema.ts')}`] }
        if (options.theme.definitions) { tsConfig.compilerOptions.paths['#pinceau/definitions'] = [`${resolve(options.theme.buildDir, 'definitions.ts')}`] }
      }

      // Push Pinceau reference
      opts.references.push({ path: 'pinceau' })
      opts.references.push({ path: 'pinceau/runtime' })

      // Add Volar plugin
      tsConfig.vueCompilerOptions = tsConfig.vueCompilerOptions || {}
      tsConfig.vueCompilerOptions.plugins = tsConfig.vueCompilerOptions.plugins || []
      tsConfig.vueCompilerOptions.plugins.push('pinceau/volar')

      // Prepares the output dir
      await prepareBuildDir(options)
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
      nuxt.options.css.push(join(buildDir, 'theme/index.css'))
    }

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.bundledStorage = nitroConfig.bundledStorage || []
      nitroConfig.bundledStorage.push('pinceau')

      nitroConfig.devStorage = nitroConfig.devStorage || {}
      nitroConfig.devStorage.pinceau = {
        driver: 'fs',
        base: join(buildDir!, 'theme'),
      }
    })

    // Support for `extends` feature
    // Will scan each layer for a config file
    options.theme.configLayers = [
      ...(options?.theme?.configLayers || []),
      ...nuxt.options._layers.reduce(
        (acc: ConfigLayer[], layer: any) => {
          if (typeof layer === 'string') { acc.push({ cwd: layer, configFileName: options.theme.configFileName }) }
          if (layer?.cwd) { acc.push({ cwd: layer?.cwd, configFileName: options.theme.configFileName }) }
          return acc
        },
        [],
      ),
    ]

    // Call options hook
    // @ts-ignore
    await nuxt.callHook('pinceau:options', options)

    // Pinceau runtime config (to be used with Nuxt Studio integration)
    nuxt.options.runtimeConfig.pinceau = { studio: options.theme.studio, outputDir: options.theme.buildDir }

    // Setup Nuxt Studio support
    if (options.theme.studio) {
      // Add server route to know Studio is enabled
      addPlugin(resolveLocalModule('./runtime/schema.server'))
      addPrerenderRoutes('/__pinceau_tokens_config.json')
      addPrerenderRoutes('/__pinceau_tokens_schema.json')

      // Push Studio config file has highest priority
      const studioAppConfigPath = resolveAlias('~/.studio')
      if (existsSync(studioAppConfigPath)) { options.theme.configLayers.unshift({ cwd: studioAppConfigPath, configFileName: 'tokens.config' }) }
    }

    // Server plugin
    addPluginTemplate({
      filename: 'pinceau-nuxt-plugin.server.mjs',
      mode: 'server',
      getContents() {
        const lines: string[] = []

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
              nuxtApp.vueApp.use(pinceau, { colorSchemeMode: '${options.theme.colorSchemeMode}', theme, utils })

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
        if (options?.theme.preflight) { lines.unshift(`import \'@unocss/reset/${typeof options.theme.preflight === 'boolean' ? 'tailwind' : options.theme.preflight}.css\'`) }

        return lines.join('\n')
      },
    })

    // Client plugin
    addPluginTemplate({
      filename: 'pinceau-nuxt-plugin.client.mjs',
      mode: 'client',
      getContents() {
        const lines: string[] = []

        if (options.runtime) {
          lines.push(
            'import { plugin as pinceau } from \'pinceau/runtime\'',
            'import utils from \'#build/pinceau/utils\'',
            `export default defineNuxtPlugin(async (nuxtApp) => nuxtApp.vueApp.use(pinceau, { colorSchemeMode: '${options.theme.colorSchemeMode}', utils }))`,
          )
        }
        else {
          lines.push(
            'import \'pinceau.css\'',
            'export default defineNuxtPlugin(() => {})',
          )
        }

        // Support any reset from @unocss/reset
        if (options?.theme.preflight) { lines.unshift(`import \'@unocss/reset/${typeof options.theme.preflight === 'boolean' ? 'tailwind' : options.theme.preflight}.css\'`) }

        return lines.join('\n')
      },
    })

    // Vite plugin
    nuxt.hook('vite:extend', (_vite: any) => {
      // vite.config.plugins = vite.config.plugins || []
      // vite.config.plugins.push(pinceau.vite(options))
    })
  },
})

export default module

declare module '@nuxt/schema' {
  interface NuxtConfig {
    pinceau?: PinceauUserOptions
  }
  interface NuxtOptions {
    pinceau?: PinceauUserOptions
  }
}
