import { defu } from 'defu'
import type { Nuxt } from '@nuxt/schema'
import { join } from 'pathe'
import type { PinceauOptions } from './types'
import pinceau, { defaultOptions } from './index'

export default function (this: any) {
  const nuxt: Nuxt = this.nuxt
  let options: PinceauOptions = (nuxt.options as any).pinceau

  // Merge options here in Nuxt context so we have access to proper values for local features
  options = defu(options, defaultOptions)

  // Automatically inject generated types to tsconfig
  nuxt.hook('prepare:types', (opts) => {
    opts.tsConfig.compilerOptions = opts.tsConfig.compilerOptions || {}
    opts.tsConfig.compilerOptions.paths = opts.tsConfig.compilerOptions.paths || {}
    if (options?.outputDir) {
      opts.tsConfig.compilerOptions.paths['#pinceau/types'] = [join(options.outputDir, 'index.d.ts')]
      opts.tsConfig.compilerOptions.paths['#pinceau'] = [join(options.outputDir, 'index.ts')]
    }
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

  // Inject pinceau entrypoint
  nuxt.options.css = nuxt.options.css || []
  nuxt.options.css.push('pinceau.css')

  // Automatically injects the CSS reset
  if (options.preflight !== false) {
    nuxt.options.css.unshift('pinceau/reset.css')
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
}
