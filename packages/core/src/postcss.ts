import postCssNested from 'postcss-nested'
import postCssCustomProperties from 'postcss-custom-properties'
import postCssDarkThemeClass from 'postcss-dark-theme-class'
import type { PinceauOptions } from './types'

/**
 * Registers PostCSS plugins inside Vite config.
 */
export function registerPostCSSPlugins(config: any, options: PinceauOptions) {
  if (!config?.css) { config.css = {} }
  if (!config.css?.postcss) { config.css.postcss = {} }
  if (!config.css?.postcss.plugins) { config.css.postcss.plugins = [] }

  // Add PostCSS plugins
  config.css.postcss.plugins.push(
    postCssNested,
    postCssCustomProperties,
  )

  // If `colorSchemeMode` is set to `class`, add postcss-dark-theme-class
  if (options.theme.colorSchemeMode === 'class') {
    config.css.postcss.plugins.push(
      postCssDarkThemeClass({
        darkSelector: '.dark',
        lightSelector: '.light',
      }),
    )
  }
}
