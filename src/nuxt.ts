import { defineNuxtModule } from '@nuxt/kit'
import type { PinceauOptions } from './types'
import pinceau from '.'

export default defineNuxtModule<PinceauOptions>(
  {
    setup(options: PinceauOptions, nuxt) {
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
    },
  },
)
