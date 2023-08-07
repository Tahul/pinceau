import type { ComputedRef } from 'vue'
import type { PinceauThemeSheet } from '@pinceau/runtime'

export * from './load'
export * from './runtime-plugin'
export * from './runtime-exports'
export * from './types'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $pinceau: ComputedRef<string>
    $pinceauTheme: PinceauThemeSheet
    $pinceauRuntime: any
  }
}
