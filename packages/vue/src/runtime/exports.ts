import type { PinceauRuntimeSheet, PinceauThemeSheet } from '@pinceau/runtime'
import type { ResponsiveProp } from '@pinceau/style'
import type { Prop } from 'vue'
import { inject } from 'vue'

/**
 * Injects global theme sheet access.
 */
export function useThemeSheet() {
  return inject('pinceauThemeSheet') as PinceauThemeSheet
}

/**
 * Injects global runtime sheet access.
 */
export function useRuntimeSheet() {
  return inject('pinceauRuntimeSheet') as PinceauRuntimeSheet
}

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export function responsiveProp<T extends string | number>(
  defaultValue: ResponsiveProp<T>,
  required = false,
) {
  return {
    type: [String, Object] as ResponsivePropType<T>,
    default: defaultValue,
    required,
  } as Prop<T>
}
