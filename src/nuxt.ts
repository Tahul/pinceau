import type { PinceauOptions } from './types'
import pinceau from '.'

export default function (this: any, options: PinceauOptions) {
  // install webpack plugin
  this.extendBuild((config: any) => {
    config.plugins = config.plugins || []
    config.plugins.unshift(pinceau.webpack(options))
  })

  // install vite plugin
  this.nuxt.hook('vite:extend', async (vite: any) => {
    vite.config.plugins = vite.config.plugins || []
    vite.config.plugins.push(pinceau.vite(options))
  })
}
