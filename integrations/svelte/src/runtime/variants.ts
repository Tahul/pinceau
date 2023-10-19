import { variantsToDeclaration } from '@pinceau/runtime'
import type { Variants } from '@pinceau/style'
import type { Writable } from 'svelte/store'
import { getRuntimeSheet } from '@pinceau/outputs/svelte-plugin'

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

  return [getRuntimeSheet().getRule(declaration, className), ...classes].filter(Boolean).join(' ')
}
