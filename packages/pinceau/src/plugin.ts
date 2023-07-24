import chalk from 'chalk'
import type { PinceauUserOptions } from '@pinceau/shared'
import { normalizeOptions, updateDebugContext } from '@pinceau/shared'
import { consola } from 'consola'
import PinceauThemePlugin from '@pinceau/theme'
import PinceauStylePLugin from '@pinceau/style'
import PinceauVuePlugin from '@pinceau/vue'
import type { Plugin } from 'vite'
import PinceauCorePlugin from './core'
import { usePinceauContext } from './context'

export default (userOptions: PinceauUserOptions = {}): (Plugin[] | Plugin)[] => {
  const options = normalizeOptions(userOptions)

  // Setup debug context context.
  updateDebugContext({
    debugLevel: options?.dev ? options.debug : false,
    logger: consola.withTag(' 🖌 '),
    // chalk.bgBlue.blue
    tag: (value: any) => chalk.bgBlue.blue(value),
    // chalk.blue
    info: (value: any) => chalk.blue(value),
    // chalk.yellow
    warning: (value: any) => chalk.yellow(value),
    // chalk.red
    error: (value: any) => chalk.red(value),
  })

  const ctx = usePinceauContext(options)

  const plugins: (Plugin[] | Plugin)[] = [
    PinceauCorePlugin.vite(ctx),
  ]

  if (userOptions.theme !== false) { plugins.push(PinceauThemePlugin.vite()) }
  if (userOptions.style !== false) { plugins.push(PinceauStylePLugin.vite()) }
  if (userOptions.vue !== false) { plugins.push(PinceauVuePlugin.vite()) }
  // if (userOptions.runtime !== false) { plugins.push(PinceauRuntimePlugin.vite(ctx)) }

  return plugins
}
