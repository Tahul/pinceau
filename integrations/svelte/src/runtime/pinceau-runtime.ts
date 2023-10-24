import type { ComputedStyleDefinition, Variants } from '@pinceau/style'
import { useComputedStyles } from './computed-styles'
import { useVariants } from './variants'

export function usePinceauRuntime(
  staticClass: string | undefined,
  computedStyles?: [string, ComputedStyleDefinition][],
  variants?: Variants,
  props: Record<string, any> = {},
) {
  let computedStylesClass: string | undefined
  if (computedStyles && computedStyles.length) { computedStylesClass = useComputedStyles(computedStyles, props, computedStylesClass) }

  let variantsClass: string | undefined
  if (variants && Object.keys(variants).length) { variantsClass = useVariants(variants, props, variantsClass) }

  return [
    staticClass,
    computedStylesClass,
    props?.class,
    variantsClass,
  ].filter(Boolean).join(' ')
}
