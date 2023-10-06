import fs from 'node:fs'
import process from 'node:process'
import { join, resolve } from 'pathe'
import { addPluginTemplate, addPrerenderRoutes, createResolver, defineNuxtModule, resolveModule } from '@nuxt/kit'
import createJITI from 'jiti'
import type { PinceauUserOptions } from '@pinceau/core'
import { walkTokens } from '@pinceau/theme/runtime'
import type { ConfigLayer } from '@pinceau/theme'
import { normalizeOptions, referencesRegex } from '@pinceau/core/utils'
import Pinceau from '@pinceau/vue/plugin'

export interface ModuleHooks {
  'pinceau:options': (options: PinceauUserOptions) => void | Promise<void>
}
export interface ModuleOptions extends PinceauUserOptions { }

const module: any = defineNuxtModule<PinceauUserOptions>({
  meta: {
    name: '@pinceau/nuxt',
    configKey: 'pinceau',
  },
  defaults: _ => ({}),
  async setup(_options, nuxt) {
    // Normalize options as soon as module gets loaded.
    const options = normalizeOptions(_options)

    // Set theme buildDir from Nuxt context
    options.theme.buildDir = resolve(nuxt.options.buildDir, 'pinceau')
    const buildDir: string = options.theme.buildDir

    // Exclude `.nuxt`
    options.style.excludes.push('**/node_modules/**/*')
    options.style.excludes.push('**/.nuxt/**')

    // Set `dev`
    options.dev = typeof nuxt.options?.dev !== 'undefined' ? nuxt.options.dev : process.env.NODE_ENV !== 'production'

    // Local module resolver
    const modulePath = createResolver(import.meta.url)
    const resolveLocalModule = (path: string) => resolveModule(path, { paths: modulePath.resolve('./') })

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
            if (fs.existsSync(join(buildDir, 'index.ts'))) {
              const _tokens = createJITI(buildDir)(join(buildDir, 'index.ts')).default
              walkTokens(_tokens?.theme || _tokens, (_, __, paths) => { cachedTokens.push(paths.join('.')) })
            }

            // Parse tokens in component code
            if (cachedTokens.length) {
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
        tsConfig.compilerOptions.paths['pinceau.css'] = [`${resolve(options.theme.buildDir, 'theme.css')}`]
        tsConfig.compilerOptions.paths['$pinceau/utils'] = [`${resolve(options.theme.buildDir, 'utils.ts')}`]
        tsConfig.compilerOptions.paths['$pinceau/theme'] = [`${resolve(options.theme.buildDir, 'theme.ts')}`]
        tsConfig.compilerOptions.paths['$pinceau/vue-plugin'] = [`${resolve(options.theme.buildDir, 'vue-plugin.ts')}`]
        tsConfig.compilerOptions.paths.$pinceau = [`${resolve(options.theme.buildDir, 'runtime.ts')}`]
        if (options.theme.schema) { tsConfig.compilerOptions.paths['$pinceau/schema'] = [`${resolve(options.theme.buildDir, 'schema.ts')}`] }
        if (options.theme.definitions) { tsConfig.compilerOptions.paths['$pinceau/definitions'] = [`${resolve(options.theme.buildDir, 'definitions.ts')}`] }
      }

      // Push Pinceau reference
      opts.references = opts.references || []
      opts.references.push({ path: '$pinceau' })
      opts.references.push({ path: 'pinceau' })

      // Add Volar plugin
      tsConfig.vueCompilerOptions = tsConfig.vueCompilerOptions || {}
      tsConfig.vueCompilerOptions.plugins = tsConfig.vueCompilerOptions.plugins || []
      tsConfig.vueCompilerOptions.plugins.push('@pinceau/volar')
    })

    // Setup Nitro plugin
    if (nuxt.options.ssr) {
      if (!nuxt.options.nitro) { nuxt.options.nitro = {} }
      const nitroConfig = nuxt.options.nitro
      nitroConfig.plugins = nitroConfig.plugins || []
      nitroConfig.plugins.push(resolveLocalModule('../server/pinceau.server.mjs'))
      nitroConfig.externals = nitroConfig.externals || {}
      nitroConfig.externals.inline = nitroConfig.externals.inline || []
      nitroConfig.externals.inline.push(resolveLocalModule('../server/pinceau.server.mjs'))
    }
    else {
      nuxt.options.css = nuxt.options.css || []
      nuxt.options.css.push(join(buildDir, 'theme.css'))
    }

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.bundledStorage = nitroConfig.bundledStorage || []
      nitroConfig.bundledStorage.push('pinceau')
      nitroConfig.devStorage = nitroConfig.devStorage || {}
      nitroConfig.devStorage.pinceau = {
        driver: 'fs',
        base: buildDir,
      }
    })

    // Support for `extends` feature
    // Will scan each layer for a config file
    options.theme.layers = [
      ...(options?.theme?.layers || []),
      ...nuxt.options._layers.reduce(
        (acc: ConfigLayer[], layer: any) => {
          if (typeof layer === 'string') { acc.push({ path: layer, configFileName: options.theme.configFileName }) }
          if (layer?.path) { acc.push({ path: layer?.path, configFileName: options.theme.configFileName }) }
          return acc
        },
        [],
      ),
    ]

    // Call options hook
    // @ts-ignore
    await nuxt.callHook('pinceau:options', options)

    // Pinceau runtime config (to be used with Nuxt Studio integration)
    nuxt.options.runtimeConfig.pinceau = { schema: options.theme.schema, outputDir: options.theme.buildDir }

    // Setup Nuxt Studio support
    if (options.theme.schema) {
      addPluginTemplate({
        filename: 'pinceau-nuxt-schema-plugin.server.mjs',
        mode: 'server',
        getContents() {
          const lines: string[] = []

          lines.push(
            'import { defineNuxtPlugin, useRequestEvent } from \'#imports\'',
            'import theme from \'#build/pinceau/theme\'',
            'import schema from \'#build/pinceau/schema\'',
            'export default defineNuxtPlugin(() => {',
            '  const event = useRequestEvent()',
            '  if (event.path === \'/__pinceau_tokens_config.json\') {',
            '    event.node.res.setHeader(\'Content-Type\', \'application/json\')',
            '    event.node.res.statusCode = 200',
            '    event.node.res.end(JSON.stringify(theme, null, 2))',
            '  }',
            '  if (event.path === \'/__pinceau_tokens_schema.json\') {',
            '    event.node.res.setHeader(\'Content-Type\', \'application/json\')',
            '    event.node.res.statusCode = 200',
            '    event.node.res.end(JSON.stringify(schema, null, 2))',
            '  }',
            '})',
          )

          return lines.join('\n')
        },
      })
      addPrerenderRoutes('/__pinceau_tokens_config.json')
      addPrerenderRoutes('/__pinceau_tokens_schema.json')
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
            '// Imports',
            'import { dirname, join } from \'pathe\'',
            'import { useRuntimeConfig } from \'#imports\'',
            '// Built targets',
            'import { PinceauVue, PinceauVueOptions } from \'#build/pinceau/vue-plugin\'',
            '// Server-side makes direct imports to built utils and theme',
            'import utils from \'#build/pinceau/utils\'',
            'import theme from \'#build/pinceau/theme\'',
            '',
            '// Plugin setup',
            `export default defineNuxtPlugin(async (nuxtApp) => {
              nuxtApp.vueApp.use(PinceauVue, { ...PinceauVueOptions, theme, utils })

              // Handle SSR
              nuxtApp.hook('app:rendered', async (app) => {
                app.ssrContext.event.$pinceauSSR = app.ssrContext.event.$pinceauSSR || {}
                app.ssrContext.event.$pinceauSSR.css = app.ssrContext.nuxt.vueApp.config.globalProperties.$pinceauSSR.toString()
                app.ssrContext.event.$pinceauSSR.options = PinceauVueOptions
              })
            })`,
          )
        }

        // Support any reset from @unocss/reset
        if (options?.theme.preflight) {
          if (options?.theme.preflight) { lines.unshift(`import \'@unocss/reset/${typeof options.theme.preflight === 'boolean' ? 'tailwind' : options.theme.preflight === 'sanitize' ? 'sanitize/sanitize' : options.theme.preflight}.css\'`) }
        }

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
            'import { PinceauVue, PinceauVueOptions } from \'#build/pinceau/vue-plugin\'',
            'import utils from \'#build/pinceau/utils\'',
            'export default defineNuxtPlugin(async (nuxtApp) => nuxtApp.vueApp.use(PinceauVue, { ...PinceauVueOptions, utils }))',
          )
        }

        return lines.join('\n')
      },
    })

    // Vite plugin
    nuxt.hook('vite:extend', (vite: any) => {
      vite.config.plugins = vite.config.plugins || []
      vite.config.plugins.push(Pinceau(options))
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
