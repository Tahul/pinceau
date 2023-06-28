import type { UserConfig as ViteConfig } from 'vite'
import postCssNested from 'postcss-nested'
import postCssCustomProperties from 'postcss-custom-properties'
import postCssDarkThemeClass from 'postcss-dark-theme-class'
import type { PinceauOptions } from './types'

/**
 * Registers PostCSS plugins.
 */
export function registerPostCssPlugins(config: ViteConfig, options: PinceauOptions) {
  if (!config?.css) { config.css = {} }
  if (!config.css?.postcss) { config.css.postcss = {} }
  // @ts-expect-error
  if (!config.css?.postcss.plugins) {
    (config.css.postcss as any).plugins = []
  }

  // Add PostCSS plugins
  (config.css.postcss as any).plugins.push(
    postCssNested,
    postCssCustomProperties,
  )

  // If `colorSchemeMode` is set to `class`, add postcss-dark-theme-class
  if (options?.colorSchemeMode === 'class') {
    (config.css.postcss as any).plugins.push(
      postCssDarkThemeClass({
        darkSelector: '.dark',
        lightSelector: '.light',
      }),
    )
  }
}
