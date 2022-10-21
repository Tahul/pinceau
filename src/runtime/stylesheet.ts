import { ref } from 'vue'
import type { ColorSchemeModes, TokensFunction } from '../types'
import { resolveCssProperty } from '../utils/css'
import { stringify } from '../utils/stringify'

export function usePinceauStylesheet(
  $tokens: TokensFunction,
  colorSchemeMode: ColorSchemeModes,
  appId?: string,
) {
  const sheet = ref()

  const declarationToCss = (decl: any) => stringify(decl, (property: any, value: any, style: any, selectors: any) => resolveCssProperty(property, value, style, selectors, $tokens, colorSchemeMode))

  const resolveStylesheet = (): CSSStyleSheet => {
    // Sheet already resolved
    if (sheet.value) { return sheet.value }

    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window

    let style
    if (global && global.document) {
      const doc = global.document
      style = doc.querySelector(`style#pinceau${appId ? `-${appId}` : ''}`)

      if (!style) {
        const styleTag = doc.createElement('style')
        styleTag.id = `pinceau${appId ? `-${appId}` : ''}`
        styleTag.type = 'text/css'
        style = styleTag
      }

      doc.head.appendChild(style)
    }

    sheet.value = style?.sheet || {
      cssRules: [],
      insertRule(cssText: any, index = this.cssRules.length) {
        (this.cssRules as any[]).splice(index, 1, { cssText })
        return index
      },
      deleteRule(index: any) {
        delete this.cssRules[index]
      },
    }

    return sheet.value
  }
  resolveStylesheet()

  const toString = () => {
    if (!sheet.value) { return '' }
    return Object.entries(sheet.value.cssRules).reduce(
      (acc, [, rule]: any) => {
        acc += `${rule?.cssText}\n` || ''
        return acc
      },
      '',
    )
  }

  const pushDeclaration = (
    declaration: any,
    previousRule?: any,
  ): CSSRule => {
    const cssText = declarationToCss({ '@media': declaration })

    if (!cssText) { return }

    const index = previousRule
      ? Object.values(sheet.value.cssRules).indexOf(previousRule)
      : sheet.value.cssRules.length

    const ruleId = sheet.value.insertRule(cssText, index)

    return sheet.value.cssRules[ruleId]
  }

  const deleteRule = (rule: CSSRule) => {
    const ruleIndex = Object.values(sheet.value.cssRules).indexOf(rule)

    if (typeof ruleIndex === 'undefined' || isNaN(ruleIndex)) { return }

    try {
      sheet.value.deleteRule(ruleIndex)
    }
    catch (e) {
      // Continue regardless of error
    }
  }

  return {
    pushDeclaration,
    deleteRule,
    sheet,
    toString,
  }
}
