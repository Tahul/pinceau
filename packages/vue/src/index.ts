import type { DtFunction, PinceauThemeSheet } from '@pinceau/shared'
import type { ComputedRef } from 'vue'

import PinceauVuePlugin from './plugin'

export * as transforms from './transforms'

export default PinceauVuePlugin

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dt: DtFunction
    $pinceau: ComputedRef<string>
    $pinceauTheme: PinceauThemeSheet
    $pinceauRuntime: any
  }
}
