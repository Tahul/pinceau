import type { PinceauUserOptions } from '@pinceau/core'
import PinceauCorePlugin from '@pinceau/core/plugin'
import { normalizeOptions } from '@pinceau/core'
import PinceauThemePlugin from '@pinceau/theme/plugin'
import PinceauStylePLugin from '@pinceau/style/plugin'
import PinceauVuePlugin from '@pinceau/vue/plugin'
import PinceauRuntimePlugin from '@pinceau/runtime/plugin'
import type { Plugin } from 'vite'

export default (userOptions: PinceauUserOptions = {}): (Plugin[] | Plugin)[] => {
  const options = normalizeOptions(userOptions)

  const plugins: (Plugin[] | Plugin)[] = [
    PinceauCorePlugin.vite(options),
  ]

  // PLugins do not need options as they are accessed through `getPinceauContext`.
  if (userOptions.theme !== false) { plugins.push(PinceauThemePlugin.vite()) }
  if (userOptions.style !== false) { plugins.push(PinceauStylePLugin.vite()) }
  if (userOptions.vue !== false) { plugins.push(PinceauVuePlugin.vite()) }
  if (userOptions.runtime !== false) { plugins.push(PinceauRuntimePlugin.vite()) }

  return plugins
}
