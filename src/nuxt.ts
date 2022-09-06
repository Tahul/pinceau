import { defu } from 'defu'
import { join } from 'pathe'
import glob from 'fast-glob'
import { addPluginTemplate, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { PinceauOptions } from './types'
import pinceau, { defaultOptions } from './index'

export default defineNuxtModule<PinceauOptions>({
  meta: {
    name: 'pinceau/nuxt',
    configKey: 'pinceau',
  },
  async setup(options: PinceauOptions, nuxt) {
    const modulePath = createResolver(import.meta.url)

    // Merge options here in Nuxt context so we have access to proper values for local features
    options = defu(options, defaultOptions)

    // Automatically inject generated types to tsconfig
    nuxt.hook('prepare:types', (opts) => {
      const tsConfig: typeof opts.tsConfig & { vueCompilerOptions?: any } = opts.tsConfig
      tsConfig.compilerOptions = tsConfig.compilerOptions || {}
      tsConfig.compilerOptions.paths = tsConfig.compilerOptions.paths || {}

      if (options?.outputDir) {
        tsConfig.compilerOptions.paths['#pinceau/types'] = [join(options.outputDir, 'index.d.ts')]
        tsConfig.compilerOptions.paths['#pinceau'] = [join(options.outputDir, 'index.ts')]
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

    // Inject Pinceau CSS
    addPluginTemplate({
      filename: 'pinceau-imports.mjs',

      getContents: () => {
        const lines = [
          'import \'pinceau.css\'',
          'export default defineNuxtPlugin(() => {})',
        ]

        if (options?.preflight !== false) {
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
