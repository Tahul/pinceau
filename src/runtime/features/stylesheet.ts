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
  function stringify(decl: any, loc?: any) {
    return _stringify(decl, (property: any, value: any, style: any, selectors: any) => resolveCssProperty(property, value, style, selectors, { $tokens, utils, options: { colorSchemeMode } } as PinceauContext, loc))
  }

  /**
   * Resolve runtime stylesheet.
   */
  function resolveStylesheet() {
    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window

    let style: HTMLStyleElement
    let hydratableSheet: HTMLStyleElement | null

    // Runtime stylesheet injection
    if (global && global.document) {
      const doc = global.document

      // Get hydratable stylesheet
      hydratableSheet = doc.querySelector(`style#pinceau-hydratable${appId ? `-${appId}` : ''}`) as HTMLStyleElement | null

      // Create runtime stylesheet
      const styleNode = doc.createElement('style')
      styleNode.id = `pinceau${appId ? `-${appId}` : ''}`
      styleNode.type = 'text/css'

      style = doc.head.appendChild(styleNode)
    }

    sheet.value
      // Runtime local stylesheet
      = style?.sheet
      // Mock a CSSStyleSheet for SSR
      || getSSRStylesheet()

    return hydratableSheet
      ? hydrateStylesheet(hydratableSheet)
      : undefined
  }

  /**
   * Hydrate the runtime stylesheet from a #pinceau-hydratable stylesheet.
   */
  function hydrateStylesheet(el?: HTMLStyleElement) {
    const hydratableRules = {}

    // Loop through SSR stylesheet CSS rules
    for (const _rule of Object.entries(el?.sheet?.cssRules || sheet.value?.cssRules || {})) {
      const [index, rule] = _rule as [string, CSSMediaRule]

      const uids = resolveUid(rule)

      if (!uids || !uids.uid) { continue }

      if (!hydratableRules[uids.uid]) { hydratableRules[uids.uid] = {} }

      const newIndex = sheet.value.insertRule(rule.cssText, Number(index))

      hydratableRules[uids.uid][uids.type] = sheet.value.cssRules.item(newIndex)
    }

    // Cleanup hydratable sheet as all rules has been injected into runtime sheet
    if (el) { el.remove() }

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
    loc?: any,
  ): CSSRule {
    if (!Object.keys(declaration).length) { return }

    const cssText = stringify(
      {
        '@media': {
          ...declaration,
          ':--p': {
          // Mark inserted declaration with unique id and type of runtime style
            '--puid': `${uid}-${type}`,
          },
        },
      },
      loc,
    )

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
    catch (e) { /* Continue regardless of errors */ }
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

/**
 * Returns a SSR-compatible version of a CSSStylesheet.
 * To be used server-side to create the stringifiable sheet.
 */
function getSSRStylesheet() {
  return {
    cssRules: [],
    insertRule(cssText: any, index = this.cssRules.length) {
      (this.cssRules as any[]).splice(index, 1, { cssText })
      return index
    },
    deleteRule(index: any) {
      delete this.cssRules[index]
    },
  } as any as CSSStyleSheet
}

/**
 * Resolve the uid and type from a rule.
 */
function resolveUid(rule: CSSMediaRule) {
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

export type PinceauRuntimeSheet = ReturnType<typeof usePinceauRuntimeSheet>
