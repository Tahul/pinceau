import type { ComputedRef } from 'vue'
import type { PinceauThemeSheet } from '@pinceau/runtime'

export * from './types'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $pinceau: ComputedRef<string>
    $pinceauTheme: PinceauThemeSheet
    $pinceauRuntime: any
  }
}
