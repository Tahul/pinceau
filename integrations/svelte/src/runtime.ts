import type { ComputedStyleDefinition, Variants } from '@pinceau/style'
import { computedStylesToDeclaration, variantsToDeclaration } from '@pinceau/runtime'
import type { Writable } from 'svelte/store'
import { runtimeSheet } from '$pinceau/svelte-plugin'

export function useComputedStyles(
  fns: [string, ComputedStyleDefinition][],
  className?: Writable<string | undefined> | undefined,
) {
  const results = fns.map(([varName, fn]) => [varName, fn()] as [string, ReturnType<ComputedStyleDefinition>])
  return runtimeSheet.getRule(computedStylesToDeclaration(results), className)
}

export function useVariants(
  variants?: Variants,
  props?: any,
  className?: Writable<string | undefined> | undefined,
) {
  const keys = Object.keys(variants || {})

  const variantsProps = Object.entries(props || {}).reduce(
    (acc, [propName, value]) => {
      if (keys.includes(propName)) { acc[propName] = value }
      return acc
    },
    {},
  )

  const { classes, declaration } = variantsToDeclaration(variants || {}, variantsProps)

  return [runtimeSheet.getRule(declaration, className), ...classes].filter(Boolean).join(' ')
}

export function usePinceauRuntime(
  staticClass: string | undefined,
  computedStyles?: [string, ComputedStyleDefinition][],
  variants?: Variants,
  props?: any,
) {
  let computedStylesClass: string | undefined
  if (computedStyles && computedStyles.length) { computedStylesClass = useComputedStyles(computedStyles) }

  let variantsClass: string | undefined
  if (variants && Object.keys(variants).length) { variantsClass = useVariants(variants, props) }

  return [
    staticClass,
    computedStylesClass,
    variantsClass,
  ].filter(Boolean).join(' ')
}
