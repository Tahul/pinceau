import type { PinceauUserOptions } from '@pinceau/core'
import PinceauCorePlugin from '@pinceau/core/plugin'
import { normalizeOptions } from '@pinceau/core/utils'
import PinceauThemePlugin from '@pinceau/theme/plugin'
import PinceauStylePLugin from '@pinceau/style/plugin'
import PinceauVuePlugin from '@pinceau/vue/plugin'
import PinceauRuntimePlugin from '@pinceau/runtime/plugin'
import type { Plugin } from 'vite'

export default (userOptions: PinceauUserOptions = {}): (Plugin[] | Plugin)[] => {
  const options = normalizeOptions(userOptions)

  const plugins: (Plugin[] | Plugin)[] = [
    // Pinceau core context provider.
    PinceauCorePlugin.vite(options),
  ]

  /**
   * PLugins do not need options as they are accessed through `getPinceauContext`.
   */

  // Core plugins
  if (userOptions.theme !== false) { plugins.push(PinceauThemePlugin.vite()) }
  if (userOptions.style !== false) { plugins.push(PinceauStylePLugin.vite()) }
  if (userOptions.runtime !== false) { plugins.push(PinceauRuntimePlugin.vite()) }

  // Framework integrations
  if (userOptions.vue !== false) { plugins.push(PinceauVuePlugin.vite()) }

  return plugins
}
