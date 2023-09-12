import { onScopeDispose, ref, unref, watch } from 'vue'
import type { Ref } from 'vue'
import type { RawCSS } from '@pinceau/style'
import { useRuntimeSheet } from './exports'

export function useStyle(
  css: Ref<RawCSS> | RawCSS,
) {
  const runtimeSheet = useRuntimeSheet()

  const className = ref<string | undefined>()

  watch(
    () => unref(css),
    (cssValue) => {
      className.value = runtimeSheet.getRule(cssValue, className.value)
    },
    {
      immediate: true,
      deep: true,
    },
  )

  onScopeDispose(() => className?.value && runtimeSheet.deleteMember(className.value))

  return className
}
