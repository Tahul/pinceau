import type { PinceauOptions } from './types'
import pinceau from '.'

export default function (this: any, options: PinceauOptions) {
  // Webpack plugin
  this.nuxt.hook('webpack:config', (config: any) => {
    config.plugins = config.plugins || []
    config.plugins.unshift(
      pinceau.webpack(options),
    )
  })

  // Vite plugin
  this.nuxt.hook('vite:extend', (vite: any) => {
    vite.config.plugins = vite.config.plugins || []
    vite.config.plugins.push(
      pinceau.vite(options),
    )
  })

  this.nuxt.options.css = this.nuxt.options.css || []
  this.nuxt.options.css.push('pinceau.css')
}
