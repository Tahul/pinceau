import { computed } from 'vue'
import type { ComponentPublicInstance, Ref } from 'vue'
import type { ComputedStyleDefinition, Variants } from '@pinceau/style'
import { useComputedStyles } from './computed-styles'
import { useVariants } from './variants'

export function usePinceauRuntime(
  staticClass: string | undefined,
  computedStyles?: [string, ComputedStyleDefinition][],
  variants?: Variants,
  props?: ComponentPublicInstance['$props'],
) {
  console.log({ props })

  let computedStylesClass: Ref<string | undefined> | undefined
  if (computedStyles && computedStyles.length) { computedStylesClass = useComputedStyles(computedStyles, props) }

  let variantsClass: Ref<string | undefined> | undefined
  if (variants && Object.keys(variants).length) { variantsClass = useVariants(variants, props) }

  return computed(() => [staticClass, variantsClass?.value, computedStylesClass?.value].filter(Boolean).join(' ') || '')
}
