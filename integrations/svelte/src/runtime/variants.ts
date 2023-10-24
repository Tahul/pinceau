import { variantsToDeclaration } from '@pinceau/runtime'
import type { Variants } from '@pinceau/style'
import { getRuntimeSheet } from '@pinceau/outputs/svelte-plugin'

export function useVariants(
  variants?: Variants,
  props?: Record<string, any>,
  className?: string | undefined,
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

  return [getRuntimeSheet().getRule(declaration, className), ...classes].filter(Boolean).join(' ')
}
