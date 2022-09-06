import { defu } from 'defu'
import type { PinceauOptions } from './types'
import pinceau, { defaultOptions } from './index'

export default function (this: any) {
  const nuxt = this.nuxt
  let options: PinceauOptions = nuxt.options.pinceau

  options = defu(options, defaultOptions)

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
