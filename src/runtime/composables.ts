import { inject } from 'vue'

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
