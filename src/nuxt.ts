import { join, resolve } from 'pathe'
import glob from 'fast-glob'
import { resolveModule, addPluginTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { PinceauOptions } from './types'
import pinceau, { defaultOptions } from './unplugin'
import { prepareOutputDir } from './theme/output'

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
    // Local module resolver
    const modulePath = createResolver(import.meta.url)
    const resolveLocalModule = (path: string) => resolveModule(path, { paths: modulePath.resolve('./') })

    // Transpile pinceau
    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push('pinceau', 'tinycolor2', 'chroma-js')

    // Call options hook
    await nuxt.callHook('pinceau:options', options)

    // Automatically inject generated types to tsconfig
    nuxt.hook('prepare:types', (opts) => {
      // Prepares the output dir
      prepareOutputDir(options)
  
      const tsConfig: typeof opts.tsConfig & { vueCompilerOptions?: any } = opts.tsConfig
      tsConfig.compilerOptions = tsConfig.compilerOptions || {}
      tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {}

      if (options?.outputDir) {
        const relativeOutputDir = options?.outputDir || join(nuxt.options.buildDir, 'pinceau/')
        tsConfig.compilerOptions.paths['#pinceau/types'] = [`${resolveModule(resolve(relativeOutputDir, 'types.ts'))}`]
        tsConfig.compilerOptions.paths['#pinceau/theme/flat'] = [`${resolveModule(resolve(relativeOutputDir, 'flat.ts'))}`]
        tsConfig.compilerOptions.paths['#pinceau/theme'] = [`${resolveModule(resolve(relativeOutputDir, 'index.ts'))}`]
      }

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

    // Push Pinceau stylesheet
    nuxt.options.css = nuxt.options.css || []

    addPluginTemplate({
      filename: 'pinceau-imports.mjs',
      getContents() {
        const lines = [
          'import { useState } from \'#app\'',
          'import \'pinceau.css\'',
          'import { plugin as pinceau } from \'pinceau/runtime\'',
          `export default defineNuxtPlugin((nuxtApp) => {
            nuxtApp.vueApp.use(pinceau, { colorSchemeMode: '${options.colorSchemeMode}' })

            // Handle first render of SSR styles
            nuxtApp.hook('app:rendered', (app) => {
              const content = app.ssrContext.nuxt.vueApp.config.globalProperties.$pinceauSsr.get()
              app.ssrContext.event.pinceauContent = content
            })
          })`,
        ]

        if (options?.preflight) { lines.unshift('import \'@unocss/reset/tailwind.css\'') }

        return lines.join('\n')
      },
    })

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
  },
})

export default module
