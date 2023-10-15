import type { ComputedStyleDefinition, Variants } from '@pinceau/style'
import { useComputedStyles } from './computed-styles'
import { useVariants } from './variants'

export function usePinceauRuntime(
  staticClass?: string | undefined,
  computedStyles?: [string, ComputedStyleDefinition][],
  variants?: Variants,
  props?: any,
) {
  let computedStylesClass: string | undefined
  if (computedStyles && computedStyles.length) { computedStylesClass = useComputedStyles(computedStyles, props) }

  let variantsClass: string | undefined
  if (variants && Object.keys(variants).length) { variantsClass = useVariants(variants, props) }

  return [
    staticClass,
    computedStylesClass,
    variantsClass,
    props?.className,
  ].filter(Boolean).join(' ')
}
