import { existsSync } from 'fs'
import { join, resolve } from 'pathe'
import glob from 'fast-glob'
import { addPluginTemplate, createResolver, defineNuxtModule, resolveModule, updateTemplates } from '@nuxt/kit'
import createJITI from 'jiti'
import type { PinceauOptions } from './types'
import pinceau, { defaultOptions } from './unplugin'
import { prepareOutputDir } from './theme/output'
import { useDebugPerformance } from './utils/debug'

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
    const { stopPerfTimer } = useDebugPerformance('Setup Nuxt module', options.debug)

    // Local module resolver
    const modulePath = createResolver(import.meta.url)
    const resolveLocalModule = (path: string) => resolveModule(path, { paths: modulePath.resolve('./') })

    // Transpile pinceau
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push('pinceau', 'chroma-js')

    // Call options hook
    await nuxt.callHook('pinceau:options', options)

    // nuxt-component-meta support
    if (options.componentMetaSupport) {
      let cachedTokens
      // @ts-ignore
      nuxt.hook('component-meta:transformers', (transformers) => {
        transformers.push(
          (component, code) => {
            const flatPath = options.outputDir

            const resolvedTokens = []

            if (!cachedTokens && existsSync(join(flatPath, 'flat.ts'))) {
              const _tokens = createJITI(flatPath)(join(flatPath, 'flat.ts')).default
              cachedTokens = Object.keys(_tokens.theme)
            }

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
    nuxt.hook('prepare:types', (opts) => {
      // Prepares the output dir
      prepareOutputDir(options)

      const tsConfig: typeof opts.tsConfig & { vueCompilerOptions?: any } = opts.tsConfig
      tsConfig.compilerOptions = tsConfig.compilerOptions || {}
      tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {}

      if (options?.outputDir) {
        const relativeOutputDir = options.outputDir
        tsConfig.compilerOptions.paths['#pinceau/types'] = [`${resolveModule(resolve(relativeOutputDir, 'types.ts'))}`]
        tsConfig.compilerOptions.paths['#pinceau/theme/flat'] = [`${resolveModule(resolve(relativeOutputDir, 'flat.ts'))}`]
        tsConfig.compilerOptions.paths['#pinceau/theme'] = [`${resolveModule(resolve(relativeOutputDir, 'index.ts'))}`]
      }

      // Add Volar plugin
      tsConfig.vueCompilerOptions = tsConfig.vueCompilerOptions || {}
      tsConfig.vueCompilerOptions.plugins = tsConfig.vueCompilerOptions.plugins || []
      tsConfig.vueCompilerOptions.plugins.push('pinceau/volar')
    })

    // Setup Nitro plugin
    if (!nuxt.options.nitro) { nuxt.options.nitro = {} }
    if (!nuxt.options.nitro.plugins) { nuxt.options.nitro.plugins = [] }
    nuxt.options.nitro.plugins.push(resolveLocalModule('./nitro'))

    // Support for `extends` feature
    // Will scan each layer for a config file
    const layerPaths = nuxt.options._layers.reduce(
      (acc: string[], layer: any) => {
        if (layer?.cwd) {
          acc.push(layer?.cwd)
        }
        return acc
      },
      [],
    )
    layerPaths.forEach(
      (path: string) => {
        if (!(options?.configOrPaths as string[]).includes(path)) {
          (options.configOrPaths as string[]).push(path)
        }
      },
    )

    // Set `cwd` from Nuxt rootDir
    options.cwd = nuxt.options.rootDir

    // Automatically inject all components in layers into includes
    for (const layer of layerPaths) {
      options.includes?.push(
        ...await glob(
          join(layer, '**/*.vue'),
          { followSymbolicLinks: options.followSymbolicLinks },
        ),
      )
    }

    addPluginTemplate({
      filename: 'pinceau-imports.mjs',
      getContents() {
        const lines = [
          'import \'pinceau.css\'',
        ]

        if (options.runtime) {
          lines.push(
            'import { useState } from \'#app\'',
            'import theme from \'#pinceau/theme/flat\'',
            'import { plugin as pinceau } from \'pinceau/runtime\'',
            `export default defineNuxtPlugin((nuxtApp) => {
              nuxtApp.vueApp.use(pinceau, { colorSchemeMode: '${options.colorSchemeMode}', theme })

              // Handle first render of SSR styles
              nuxtApp.hook('app:rendered', (app) => {
                const content = app.ssrContext.nuxt.vueApp.config.globalProperties.$pinceauSsr.get()
                app.ssrContext.event.pinceauContent = content
              })
            })`,
          )
        }

        if (options?.preflight) { lines.unshift('import \'@unocss/reset/tailwind.css\'') }

        return lines.join('\n')
      },
    })

    options.configResolved = async () => {
      await updateTemplates({
        filter(template) {
          if (template.filename === 'pinceau-imports.mjs') { return true }
          return false
        },
      })
    }

    // Webpack plugin
    nuxt.hook('webpack:config', (config: any) => {
      config.plugins = config.plugins || []
      config.plugins.unshift(pinceau.webpack(options))
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
