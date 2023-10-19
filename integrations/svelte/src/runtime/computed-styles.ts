import type { ComputedStyleDefinition } from '@pinceau/style'
import { computedStylesToDeclaration } from '@pinceau/runtime'
import type { Writable } from 'svelte/store'
import { getRuntimeSheet } from '@pinceau/outputs/svelte-plugin'

export function useComputedStyles(
  fns: [string, ComputedStyleDefinition][],
  className?: Writable<string | undefined> | undefined,
) {
  const results = fns?.map?.(([varName, fn]) => [varName, fn({})] as [string, ReturnType<ComputedStyleDefinition>])
  return getRuntimeSheet().getRule(computedStylesToDeclaration(results), className)
}
