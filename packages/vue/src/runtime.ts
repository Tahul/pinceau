import { computed, getCurrentInstance } from 'vue'
import type { Variants } from '@pinceau/style'

export * from './runtime/exports'

export { useThemeSheet, useRuntimeSheet } from '@pinceau/runtime'

export function usePinceauRuntime(uid: string) {
  console.log({ uid })

  return {
    $pinceau: '',
  }
}

export function useVariants(variants: Variants) {
  const component = getCurrentInstance()

  const props = computed(() => component?.props)

  Object.entries(variants).forEach(
    ([key, variant]) => {
      if (!props.value?.[key]) {}
    },
  )
}

export function useComputedStyle(variable: string, computedStyleFunc: () => string) {
  const component = getCurrentInstance()

  /*
  console.log({
    component,
    variable,
    computedStyleFunc,
  })
  */
}
