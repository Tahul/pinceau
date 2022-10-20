import { join } from 'pathe'
import type { UserConfig as ViteConfig } from 'vite'
import postCssNested from 'postcss-nested'
import postCssCustomProperties from 'postcss-custom-properties'
import type { PinceauOptions } from '../types'

export function registerAliases(config: ViteConfig, options: PinceauOptions) {
  if (!config?.resolve) { config.resolve = {} }
  if (!config.resolve?.alias) { config.resolve.alias = {} }
  if (options?.outputDir) {
    config.resolve.alias['#pinceau/types'] = join(options.outputDir, '/types.ts')
    config.resolve.alias['#pinceau/theme/flat'] = join(options.outputDir, '/flat.ts')
    config.resolve.alias['#pinceau/theme'] = join(options.outputDir, '/index.ts')
  }
}

export function registerPostCssPlugins(config: ViteConfig, _: PinceauOptions) {
  if (!config?.css) { config.css = {} }
  if (!config.css?.postcss) { config.css.postcss = {} }
  // @ts-expect-error - PostCSS typings wrong?
  if (!config.css?.postcss.plugins) {
    (config.css.postcss as any).plugins = []
  }

  (config.css.postcss as any).plugins.push(
    postCssNested,
    postCssCustomProperties,
  )
}
