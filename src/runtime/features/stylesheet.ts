import { ref } from 'vue'
import { deepAssign, deepDelete } from '../../utils/deep'
import type { ColorSchemeModes, PinceauContext, PinceauUidTypes, TokensFunction } from '../../types'
import { resolveCssProperty } from '../../utils/css'
import { stringify as _stringify } from '../../utils/stringify'

export function usePinceauRuntimeSheet(
  $tokens: TokensFunction,
  utils: any = {},
  colorSchemeMode: ColorSchemeModes,
  appId?: string,
) {
  // Local runtime stylesheet reference.
  const sheet = ref<CSSStyleSheet>()

  // Local cache for each token CSSRule index.
  const cache = {}

  // Handle dev HMR
  if (import.meta.hot) {
    // Deep update theme from new definition
    import.meta.hot.on(
      'pinceau:themeUpdate',
      (newTheme) => {
        deepAssign(utils, newTheme.utils)
        deepDelete(utils, newTheme.utils)
      },
    )
  }

  /**
   * Stringify CSS declaration.
   */
  function stringify(decl: any) {
    return _stringify(decl, (property: any, value: any, style: any, selectors: any) => resolveCssProperty(property, value, style, selectors, { $tokens, utils, options: { colorSchemeMode } } as PinceauContext))
  }

  /**
   * Resolve runtime stylesheet.
   */
  function resolveStylesheet() {
    // Sheet already resolved
    if (sheet.value) { return sheet.value }

    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window

    let isHydratable = false

    let style: HTMLStyleElement
    if (global && global.document) {
      const doc = global.document
      style = doc.querySelector(`style#pinceau${appId ? `-${appId}` : ''}`) as HTMLStyleElement | null

      if (!style) {
        const styleTag = doc.createElement('style')
        styleTag.id = `pinceau${appId ? `-${appId}` : ''}`
        styleTag.type = 'text/css'
        style = styleTag as HTMLStyleElement
      }

      if (style.attributes.getNamedItem('data-hydratable')) { isHydratable = true }

      doc.head.appendChild(style)
    }

    sheet.value
      // Runtime local stylesheet
      = style?.sheet
      // Mock a CSSStyleSheet
      || {
        cssRules: [],
        insertRule(cssText: any, index = this.cssRules.length) {
          (this.cssRules as any[]).splice(index, 1, { cssText })
          return index
        },
        deleteRule(index: any) {
          delete this.cssRules[index]
        },
      } as any as CSSStyleSheet

    return isHydratable ? hydrateStylesheet(style) : undefined
  }

  function hydrateStylesheet(el?: HTMLStyleElement) {
    const hydratableRules = {}

    /**
     * Resolve the uid and type from a rule.
     */
    const resolveUid = (rule: CSSMediaRule) => {
      const uidRule: any = rule.cssRules && rule.cssRules.length
        ? Object.entries((rule as any)?.cssRules).find(
          ([_, rule]: any) => {
            if (rule.selectorText !== ':--p') { return false }

            return true
          },
        )
        : undefined

      if (!uidRule) { return }

      const uidRegex = /--puid:(.*)?-(c|v|p)?/m
      const [, uid, type] = uidRule[1].cssText.match(uidRegex)

      if (!uid) { return }

      return { uid, type }
    }

    /**
     * Iterate through SSR stylesheet CSS rules
     */
    for (const _rule of Object.entries(sheet.value.cssRules)) {
      const [, rule] = _rule as [string, CSSMediaRule]

      const uids = resolveUid(rule)

      if (!uids || !uids.uid) { continue }

      if (!hydratableRules[uids.uid]) { hydratableRules[uids.uid] = {} }

      hydratableRules[uids.uid][uids.type] = rule
    }

    if (el) { el.attributes.removeNamedItem('data-hydratable') }

    return hydratableRules
  }

  /**
   * Stringify the stylesheet; to be used from SSR context.
   */
  function toString() {
    if (!sheet.value) { return '' }
    return Object.entries(sheet.value.cssRules).reduce(
      (acc, [, rule]: any) => {
        acc += `${rule?.cssText}\n` || ''
        return acc
      },
      '',
    )
  }

  /**
   * Push a cacheable rule to runtime stylesheet.
   */
  function pushDeclaration(
    uid: string,
    type: PinceauUidTypes,
    declaration: any,
    previousRule?: any,
  ): CSSRule {
    if (!Object.keys(declaration).length) { return }

    const cssText = stringify({
      '@media': {
        ...declaration,
        ':--p': {
          // Mark inserted declaration with unique id and type of runtime style
          '--puid': `${uid}-${type}`,
        },
      },
    })

    if (!cssText) { return }

    if (previousRule) { deleteRule(previousRule) }

    const ruleId = sheet.value.insertRule(cssText)

    return sheet.value.cssRules[ruleId]
  }

  /**
   * Delete a rule from runtime stylesheet.
   */
  function deleteRule(rule: CSSRule) {
    const ruleIndex = Object.values(sheet.value.cssRules).indexOf(rule)

    if (typeof ruleIndex === 'undefined' || isNaN(ruleIndex)) { return }

    try { sheet.value.deleteRule(ruleIndex) }
    catch (e) { /* Continue regardless of error */ }
  }

  const hydratableRules = resolveStylesheet()

  return {
    stringify,
    cache,
    pushDeclaration,
    deleteRule,
    sheet,
    toString,
    hydratableRules,
  }
}

export type PinceauRuntimeSheet = ReturnType<typeof usePinceauRuntimeSheet>
