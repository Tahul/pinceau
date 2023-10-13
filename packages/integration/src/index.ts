import PinceauThemePlugin from '@pinceau/theme/plugin'
import PinceauStylePlugin from '@pinceau/style/plugin'
import PinceauRuntimePlugin from '@pinceau/runtime/plugin'
import PinceauCorePlugin from '@pinceau/core/plugin'
import type { UnpluginInstance } from 'unplugin'
import type { Plugin } from 'vite'
import type { PinceauUserOptions } from '@pinceau/core'
import { normalizeOptions } from '@pinceau/core/utils'

export function createPinceauIntegration(
  extensions?: [string, UnpluginInstance<any>][],
  defaultOptions: PinceauUserOptions = {},
): (userOptions?: PinceauUserOptions) => (Plugin[] | Plugin)[] {
  const getPlugins = (userOptions: PinceauUserOptions = {}) => {
    const options = normalizeOptions({ ...defaultOptions, ...userOptions })

    const plugins: (Plugin[] | Plugin)[] = []

    // Push core plugins
    plugins.push(PinceauCorePlugin.vite(options))
    if (userOptions.theme !== false) { plugins.push(PinceauThemePlugin.vite()) }
    if (userOptions.style !== false) { plugins.push(PinceauStylePlugin.vite()) }
    if (userOptions.runtime !== false) { plugins.push(PinceauRuntimePlugin.vite()) }

    if (!extensions) { return plugins }

    // Push additional extensions
    for (const extension of extensions) {
      const [key, plugin] = extension
      if (userOptions[key] !== false) { plugins.push(plugin.vite()) }
    }

    return plugins
  }

  return getPlugins
}
