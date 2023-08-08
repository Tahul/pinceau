import { getCurrentInstance } from 'vue'
import type { Variants } from '@pinceau/runtime'

export { useThemeSheet, useRuntimeSheet } from '@pinceau/runtime'

export function useVariants(variants: Variants) {
  const component = getCurrentInstance()

  console.log({
    component,
    variants,
  })
}

export function useComputedStyle(variable: string, computedStyleFunc: () => string) {
  const component = getCurrentInstance()

  console.log({
    component,
    variable,
    computedStyleFunc,
  })
}
