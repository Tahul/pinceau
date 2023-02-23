import type { ComputedRef } from 'vue'
import type { usePinceauThemeSheet } from './runtime/features/theme'
import type { DtFunction, PinceauOptions } from './types'

/**
 * Exposes @nuxt/kit types from index so Nuxt recognizes typings properly for Pinceau inside the `nuxt.config.ts` file.
 */
export interface ModuleHooks {
  'pinceau:options': (options: PinceauOptions) => void | Promise<void>
}
export interface ModuleOptions extends PinceauOptions {}

export * from './types'

/**
 * Main file only exports `defineTheme`.
 *
 * This allows the config file to only inline `defineTheme` when it is imported by `jiti`.
 *
 * Pinceau also exports:
 * - `pinceau/utils`: Exposes all the internal functions of Pinceau.
 * - `pinceau/vite`: Exposes the Vite plugin.
 * - `pinceau/runtime`: Exposes runtime features.
 * - `pinceau/types`: Exposes all types from a single entry point.
 * - `pinceau/nuxt`: Exposes the Nuxt module.
 * - `pinceau/nitro`: Exposes the Nitro (SSR) plugin, is usually loaded automatically by the Nuxt module.
 * - `pinceau/volar`: Exposes the Volar plugin that provides type-safety for Pinceau contexts.
 */

export { defineTheme } from './theme/define'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dt: DtFunction
    $pinceau: ComputedRef<string>
    $pinceauTheme: ReturnType<typeof usePinceauThemeSheet>
    $pinceauRuntime: any
  }
}

declare module '@nuxt/schema' {
  interface NuxtHooks extends ModuleHooks {}
  interface NuxtConfig {
    pinceau?: ModuleOptions
  }
}

/**
 * Globals
 *
 * TODO: Move out to Volar plugin
 */
declare global {
  const $dt: DtFunction
  const $pinceau: string
  const __$pProps: any
}
