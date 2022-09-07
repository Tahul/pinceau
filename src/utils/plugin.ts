import { join } from 'pathe'
import type { UserConfig as ViteConfig } from 'vite'
import postCssNested from 'postcss-nested'
import postCssCustomProperties from 'postcss-custom-properties'
import type { PinceauOptions } from '../types'

export function registerAliases(config: ViteConfig, options: PinceauOptions) {
  if (!config?.resolve) { config.resolve = {} }
  if (!config.resolve?.alias) { config.resolve.alias = {} }
  // @ts-expect-error - TODO
  config.resolve.alias['#pinceau/types'] = join(options?.outputDir || process.cwd(), '/types.ts')
  // @ts-expect-error - TODO
  config.resolve.alias['#pinceau/*'] = join(options?.outputDir || process.cwd(), '/*')
}

export function registerPostCssPlugins(config: ViteConfig) {
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
