import type { ComputedStyleDefinition } from '@pinceau/style'
import { computedStylesToDeclaration } from '@pinceau/runtime'
import { onScopeDispose, ref, watch } from 'vue'
import type { ComponentPublicInstance, Ref } from 'vue'
import { useRuntimeSheet } from './exports'

export function useComputedStyles(
  fns: [string, ComputedStyleDefinition][],
  props?: ComponentPublicInstance['$props'],
): Ref<string | undefined> {
  const runtimeSheet = useRuntimeSheet()

  /**
   * Current computed styles className
   */
  const className = ref<string | undefined>()

  watch(
    () => fns.map(([varName, fn]) => [varName, fn(props || {})] as [string, ReturnType<ComputedStyleDefinition>]),
    (results: [string, ReturnType<ComputedStyleDefinition>][]) => {
      if (!runtimeSheet) { return }
      className.value = runtimeSheet.getRule(computedStylesToDeclaration(results), className.value)
    },
    {
      immediate: true,
    },
  )

  onScopeDispose(() => className?.value && runtimeSheet.deleteMember(className.value))

  return className
}
