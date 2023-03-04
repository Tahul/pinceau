import { join } from 'pathe'
import type { UserConfig as ViteConfig } from 'vite'
import postCssNested from 'postcss-nested'
import postCssCustomProperties from 'postcss-custom-properties'
import postCssDarkThemeClass from 'postcss-dark-theme-class'
import type { PinceauOptions } from '../types'

export function registerAliases(config: ViteConfig, options: PinceauOptions) {
  if (!config?.resolve) { config.resolve = {} }
  if (!config.resolve?.alias) { config.resolve.alias = {} }
  if (options?.buildDir) {
    config.resolve.alias['#pinceau/theme'] = join(options.buildDir, '/index.ts')
    config.resolve.alias['#pinceau/utils'] = join(options.buildDir, '/utils.ts')
  }
}

export function registerPostCssPlugins(config: ViteConfig, options: PinceauOptions) {
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

  if (options?.colorSchemeMode === 'class') {
    (config.css.postcss as any).plugins.push(
      postCssDarkThemeClass({
        darkSelector: '.dark',
        lightSelector: '.light',
      }),
    )
  }
}
