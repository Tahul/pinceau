import type { PinceauRuntimeIds, PinceauRuntimeSheet } from './types'

export function usePinceauCssProp(
  ids: PinceauRuntimeIds,
  props: any,
  sheet: PinceauRuntimeSheet,
  loc: any,
) {
  let rule: CSSRule | undefined = sheet.hydratableRules?.[ids.uid]?.p

  const refresh = (value: any) => {
    rule = sheet.pushDeclaration(
      ids.uid,
      'p',
      transformCssPropToDeclaration(ids, value),
      rule,
      { ...loc, type: 'c' },
    )
  }

  const destroy = () => rule && sheet.deleteRule(rule)

  return {
    rule,
    refresh,
    destroy,
  }
}

/**
 * Transform CSS Prop to stringifiable object.
 */
export function transformCssPropToDeclaration(
  ids: PinceauRuntimeIds,
  css: any,
) {
  const declaration: any = {}

  if (css) {
    const targetId = `.${ids.uniqueClassName}${ids.componentId}`
    declaration[targetId] = Object.assign(declaration[targetId] || {}, css)
  }

  return declaration
}
