import { stringify as pinceauStringify, resolveCssProperty } from '@pinceau/stringify'
import type { ColorSchemeModes, PinceauUtils, TokensFunction } from '@pinceau/theme'
import type { CachedCSSRule, PinceauRuntimeSheet, PinceauUidTypes } from './types'

const HYDRATION_SELECTOR = '.phy[--]'

export function usePinceauRuntimeSheet(
  $tokens: TokensFunction,
  utils: PinceauUtils,
  colorSchemeMode: ColorSchemeModes,
  appId?: string,
): PinceauRuntimeSheet {
  // Local runtime stylesheet reference
  let sheet: CSSStyleSheet | undefined

  // Local cache for each token CSSRule index
  const cache: { [key: string]: CachedCSSRule } = {}

  /**
   * Runtime declaration stringifier.
   */
  const stringify = (decl: any, loc?: any) => pinceauStringify(
    decl,
    stringifyContext => resolveCssProperty(
      stringifyContext,
      {
        loc,
        localTokens: {},
      } as any,
    ),
  )

  /**
   * Resolve runtime stylesheet.
   */
  function resolveStylesheet() {
    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window

    let style: HTMLStyleElement | undefined
    let hydratableSheet: HTMLStyleElement | undefined

    // Runtime stylesheet injection
    if (global && global.document) {
      const fullId = `pinceau-runtime${appId ? `-${appId}` : ''}`
      const doc = global.document

      // Find existing sheet
      style = doc.querySelector<HTMLStyleElement>(`style#${fullId}`) || undefined

      // Create runtime stylesheet
      if (!style) {
        const styleNode = doc.createElement('style')
        styleNode.id = fullId
        styleNode.type = 'text/css'
        style = doc.head.appendChild(styleNode)
      }

      // Get hydratable stylesheet
      hydratableSheet = doc.querySelector(`style#pinceau-runtime${appId ? `-${appId}` : ''}`) as HTMLStyleElement
    }

    sheet
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
    const hydratableRules: PinceauRuntimeSheet['hydratableRules'] = {}

    // No sheet, no hydration
    if (!sheet) { return }

    // Loop through SSR stylesheet CSS rules
    for (const _rule of Object.entries(el?.sheet?.cssRules || sheet?.cssRules || {})) {
      const [index, rule] = _rule as [string, CSSMediaRule]

      const uids = resolveUid(rule)

      if (!uids || !uids.uid) { continue }

      if (!hydratableRules[uids.uid]) { hydratableRules[uids.uid] = {} }

      const newIndex = sheet.insertRule(rule.cssText, Number(index))

      hydratableRules[uids.uid][uids.type] = sheet.cssRules.item(newIndex) || undefined
    }

    // Cleanup hydratable sheet as all rules has been injected into runtime sheet
    if (el) { el.remove() }

    return hydratableRules
  }

  /**
   * Stringify the stylesheet; to be used from SSR context.
   */
  function toString() {
    if (!sheet) { return '' }
    return Object.entries(sheet.cssRules).reduce(
      (acc, [, rule]: any) => {
        acc += `${rule?.cssText} ` || ''
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
  ): CSSRule | undefined {
    if (
      !Object.keys(declaration).length
      || !sheet
    ) { return }

    const cssText = stringify(
      {
        '@media': {
          // Mark inserted declaration with unique id and type of runtime style
          [HYDRATION_SELECTOR]: { '--puid': `${uid}-${type}` },
          ...declaration,
        },
      },
      loc,
    )

    if (!cssText) { return }

    if (previousRule) { deleteRule(previousRule) }

    const ruleId = sheet.insertRule(cssText)

    return sheet.cssRules[ruleId]
  }

  /**
   * Delete a rule from runtime stylesheet.
   */
  function deleteRule(rule: CSSRule) {
    if (!sheet) { return }

    const ruleIndex = Object.values(sheet.cssRules).indexOf(rule)

    if (typeof ruleIndex === 'undefined' || Number.isNaN(ruleIndex)) { return }

    try { sheet.deleteRule(ruleIndex) }
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
 *
 * To be used server-side to create the stringifiable sheet.
 */
function getSSRStylesheet() {
  const cssRules: CSSRule[] = []

  return {
    cssRules,
    insertRule(cssText: string, index: number = cssRules.length) {
      cssRules.splice(index, 1, { cssText } as CSSRule)
      return index
    },
    deleteRule(index: number) { delete cssRules[index] },
  } as any as CSSStyleSheet
}

/**
 * Resolve the uid and type from a rule.
 */
function resolveUid(rule: CSSMediaRule) {
  const uidRule: any = (rule.cssRules && rule.cssRules.length)
    ? Object.entries((rule as any)?.cssRules).find(([_, rule]: any) => rule.selectorText === HYDRATION_SELECTOR)
    : undefined

  if (!uidRule) { return }

  const uidRegex = /--puid:(.*)?-(c|v|p)?/m
  const [, uid, type] = uidRule[1].cssText.match(uidRegex)

  if (!uid) { return }

  return { uid, type }
}
