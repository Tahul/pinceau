import type { ComputedRef } from 'vue'
import { computed, onScopeDispose, watch } from 'vue'
import type { PinceauRuntimeIds } from '../../types'
import type { usePinceauStylesheet } from '../stylesheet'

export function usePinceauCssProp(
  ids: ComputedRef<PinceauRuntimeIds>,
  props: ComputedRef<any>,
  sheet: ReturnType<typeof usePinceauStylesheet>,
) {
  let rule: CSSRule = sheet.hydratableRules?.[ids.value.uid]?.p
  const css = computed(() => props.value?.css)

  watch(
    css,
    (newCss) => {
      newCss = transformCssPropToDeclaration(ids.value, newCss)
      if (rule) { sheet.deleteRule(rule) }
      rule = sheet.pushDeclaration(
        ids.value.uid,
        'p',
        newCss,
      )
    },
    {
      immediate: !(rule),
    },
  )

  onScopeDispose(() => rule && sheet.deleteRule(rule))
}

/**
 * Transform CSS Prop to stringifiable object.
 */
export function transformCssPropToDeclaration(
  ids: PinceauRuntimeIds,
  css: any,
) {
  const declaration = {}

  if (css) {
    const targetId = `.${ids.uniqueClassName}${ids.componentId}`
    declaration[targetId] = Object.assign(declaration[targetId] || {}, css)
  }

  return declaration
}
