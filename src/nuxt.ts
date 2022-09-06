import { defu } from 'defu'
import type { PinceauOptions } from './types'
import pinceau, { defaultOptions } from './index'

export default function (this: any, options: PinceauOptions) {
  const nuxt = this.nuxt

  options = defu(options, defaultOptions)

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

  nuxt.options.css = nuxt.options.css || []
  nuxt.options.css.push('pinceau.css')

  if (options.preflight !== false) {
    nuxt.options.css.unshift('pinceau/reset.css')
  }
}
