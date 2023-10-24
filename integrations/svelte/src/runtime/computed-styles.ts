import type { ComputedStyleDefinition } from '@pinceau/style'
import { computedStylesToDeclaration } from '@pinceau/runtime'
import { getRuntimeSheet } from '@pinceau/outputs/svelte-plugin'

export function useComputedStyles(
  fns: [string, ComputedStyleDefinition][],
  props: Record<string, any> = {},
  className?: string,
) {
  const results = fns?.map?.(([varName, fn]) => [varName, fn(props)] as [string, ReturnType<ComputedStyleDefinition>])
  return getRuntimeSheet().getRule(computedStylesToDeclaration(results), className)
}
