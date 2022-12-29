import type { PropType } from 'vue'
import { inject } from 'vue'
import type { CSSProperties, ComputedStyleProp, NativeProperties } from '../types'
import type { usePinceauThemeSheet } from './features/theme'

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
 * Exposes the Pinceau theme sheet features.
 */
export function usePinceauTheme(): ReturnType<typeof usePinceauThemeSheet> {
  return (inject('pinceauTheme') as any)
}

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export const cssProp = {
  type: Object as PropType<CSSProperties>,
  required: false,
  default: undefined,
}

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export function computedStyle<T extends keyof NativeProperties>(
  attribute: T,
  // @ts-ignore
  defaultValue: ComputedStyleProp,
  required = false,
) {
  return {
    type: [String, Object] as PropType<ComputedStyleProp>,
    required,
    default: defaultValue,
  }
}
