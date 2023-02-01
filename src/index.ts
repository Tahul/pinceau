import type { ComputedRef } from 'vue'
import type { usePinceauThemeSheet } from './runtime/features/theme'
import type { DtFunction, PinceauOptions } from './types'

export * from './types'
export { defineTheme } from './theme/define'
export { palette } from './utils/palette'
export { get } from './utils/data'

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

declare global {
  const $dt: DtFunction
  const $pinceau: string
  const __$pProps: any
}

export interface ModuleHooks {
  'pinceau:options': (options: PinceauOptions) => void | Promise<void>
}

export interface ModuleOptions extends PinceauOptions {
  //
}
