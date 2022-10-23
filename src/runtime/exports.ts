import type { PropType } from 'vue'
import { inject } from 'vue'
import type { CSS, ComputedStyleProp, DefaultThemeMap, PinceauTheme } from '../types'

/**
 * Entrypoint for Pinceau runtime features.
 */
export function usePinceauRuntime(
  props: any,
  variants: any,
  computedStyles: any,
): void {
  return (inject('pinceauRuntime') as any)(props, variants, computedStyles)
}

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export const cssProp = {
  type: Object as PropType<CSS<PinceauTheme, {}, {}, false>>,
  required: false,
  default: undefined,
}

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export function computedStyle<T extends keyof DefaultThemeMap>(
  attribute: T,
  defaultValue: ComputedStyleProp<T>,
  required = false,
) {
  return {
    type: [String, Object] as PropType<ComputedStyleProp<T>>,
    required,
    default: defaultValue,
  }
}
