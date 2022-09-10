import { defu } from 'defu'
import { join, resolve } from 'pathe'
import glob from 'fast-glob'
import { addPluginTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import { withoutLeadingSlash } from 'ufo'
import type { PinceauOptions } from './types'
import pinceau, { defaultOptions } from './index'

const module: any = defineNuxtModule<PinceauOptions>({
  meta: {
    name: 'pinceau/nuxt',
    configKey: 'pinceau',
  },
  async setup(options: PinceauOptions, nuxt) {
    const modulePath = createResolver(import.meta.url)

    // Merge options here in Nuxt context so we have access to proper values for local features
    options = defu(options, defaultOptions)

    // Call options hook
    await nuxt.callHook('pinceau:options', options)

    // Automatically inject generated types to tsconfig
    nuxt.hook('prepare:types', (opts) => {
      const tsConfig: typeof opts.tsConfig & { vueCompilerOptions?: any } = opts.tsConfig
      tsConfig.compilerOptions = tsConfig.compilerOptions || {}
      tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {}

      if (options?.outputDir) {
        let relativeOutputDir = options?.outputDir
        if (options?.outputDir.includes(nuxt.options.rootDir)) {
          relativeOutputDir = options?.outputDir.replace(nuxt.options.rootDir, '')
          relativeOutputDir = resolve('../', relativeOutputDir)
          relativeOutputDir = withoutLeadingSlash(relativeOutputDir)
        }

        tsConfig.compilerOptions.paths['#pinceau/types'] = [`${resolve(relativeOutputDir, 'types.ts')}`]
        tsConfig.compilerOptions.paths['#pinceau'] = [`${resolve(relativeOutputDir, 'index.ts')}`]
      }

      tsConfig.vueCompilerOptions = tsConfig.vueCompilerOptions || {}
      tsConfig.vueCompilerOptions.plugins = tsConfig.vueCompilerOptions.plugins || []
      tsConfig.vueCompilerOptions.plugins.push(modulePath.resolve('../volar'))
    })

    // Support for `extends` feature
    // This will scan each layer for a config file
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

    // Automatically inject all components in layers into includes
    for (const layer of layerPaths) {
      options.includes?.push(...await glob(join(layer, '**/*.vue')))
    }

    addPluginTemplate({
      filename: 'pinceau-imports.mjs',
      getContents() {
        const lines = [
          'import \'pinceau.css\'',
          'export default defineNuxtPlugin(() => {})',
        ]

        if (options?.preflight) {
          lines.unshift('import \'@unocss/reset/tailwind.css\'')
        }

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
