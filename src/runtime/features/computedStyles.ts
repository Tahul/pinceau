import { kebabCase } from 'scule'
import type { ComputedRef, Ref } from 'vue'
import { onScopeDispose, unref, watch } from 'vue'
import type { PinceauRuntimeIds } from '../../types'
import type { usePinceauStylesheet } from '../stylesheet'

export function usePinceauComputedStyles(
  r: Ref<number>,
  ids: ComputedRef<PinceauRuntimeIds>,
  computedStyles: Ref<any>,
  sheet: ReturnType<typeof usePinceauStylesheet>,
) {
  let rule: CSSRule = sheet.hydratableRules?.[ids.value.uid]?.p

  watch(
    [r, computedStyles],
    ([r, newComputedStyles]) => {
      newComputedStyles = transformComputedStylesToDeclaration(ids.value, newComputedStyles)
      rule = sheet.pushDeclaration(
        ids.value.uid,
        'c',
        newComputedStyles,
        rule,
      )
    },
    {
      immediate: !(rule),
      deep: true,
    },
  )

  onScopeDispose(() => rule && sheet.deleteRule(rule))
}

/**
 * Transform computed styles and props to a stringifiable object.
 */
export function transformComputedStylesToDeclaration(
  ids: PinceauRuntimeIds,
  computedStyles: { [id: string]: any },
) {
  const declaration = {}

  const targetId = `.${ids.uniqueClassName}${ids.componentId}`

  // Iterate through computed styles
  if (computedStyles && Object.keys(computedStyles).length) {
    declaration[targetId] = declaration[targetId] || {}

    // Iterate on each computed styles
    for (const [varName, _value] of Object.entries(computedStyles)) {
      const value = unref(_value)

      // Handle CSS Prop
      if (varName === 'css') {
        declaration[targetId] = Object.assign(declaration[targetId], value)
        continue
      }

      // Prop value is an object, iterate through each `@mq`
      if (typeof value === 'object') {
        for (const [mqId, mqPropValue] of Object.entries(value)) {
          const _value = unref(mqPropValue) as string

          if (!_value) { continue }

          if (mqId === 'initial') {
            if (!declaration[targetId]) { declaration[targetId] = {} }
            if (!declaration[targetId]) { declaration[targetId] = {} }
            declaration[targetId][`--${varName}`] = _value
          }

          const mediaId = `@${mqId}`

          if (!declaration[mediaId]) { declaration[mediaId] = {} }
          if (!declaration[mediaId][targetId]) { declaration[mediaId][targetId] = {} }

          declaration[mediaId][targetId][`--${kebabCase(varName)}`] = _value
        }
      }
      else {
        const _value = unref(value)
        if (_value) {
          declaration[targetId][`--${kebabCase(varName)}`] = _value
        }
      }
    }
  }

  return declaration
}

