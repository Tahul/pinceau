import { kebabCase } from 'scule'
import type { PinceauRuntimeIds, PinceauRuntimeSheet } from './types'

export function usePinceauComputedStyle(
  value: string,
  ids: PinceauRuntimeIds,
  sheet: PinceauRuntimeSheet,
  loc: any,
) {
  let rule: CSSRule | undefined = sheet.hydratableRules?.[ids.uid]?.c

  const refresh = (value: any) => {
    rule = sheet.pushDeclaration(
      ids.uid,
      'c',
      computedStylesToDeclaration(ids, value),
      rule,
      { ...loc, type: 'c' },
    )
  }

  const destroy = () => rule && sheet.deleteRule(rule)

  if (!rule) { refresh(value) }

  return {
    rule,
    refresh,
    destroy,
  }
}

/**
 * Transform computed styles and props to a stringifiable object.
 */
export function computedStylesToDeclaration(
  ids: PinceauRuntimeIds,
  computedStyles: { [id: string]: any },
) {
  const declaration: { [key: string]: any } = {}

  const targetId = `.${ids.uniqueClassName}${ids.componentId}`

  // Iterate through computed styles
  if (computedStyles && Object.keys(computedStyles).length) {
    declaration[targetId] = declaration[targetId] || {}

    // Iterate on each computed styles
    for (const [varName, _value] of Object.entries(computedStyles)) {
      const value = _value?.value || _value

      // Handle CSS Prop
      if (varName === 'css') {
        declaration[targetId] = Object.assign(declaration[targetId], value)
        continue
      }

      // Prop value is an object, iterate through each `@mq`
      if (typeof value === 'object') {
        for (const [mqId, mqPropValue] of Object.entries(value)) {
          const _value = (mqPropValue as any)?.value || mqPropValue as string

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
        const _value = value?.value || value

        if (_value) {
          declaration[targetId][`--${kebabCase(varName)}`] = _value
        }
      }
    }
  }

  return declaration
}
