import { ref } from 'vue'

export function usePinceauStylesheet(appId?: string) {
  let _sheet

  const resolveStylesheet = (): CSSStyleSheet => {
    // Sheet already resolved
    if (_sheet) { return _sheet }

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

    _sheet = style?.sheet || {
      cssRules: [],
      insertRule(cssText: any, index = this.cssRules.length) {
        (this.cssRules as any[]).splice(index, 1, { cssText })
        return index
      },
      deleteRule(index: any) {
        delete this.cssRules[index]
      },
    }

    return _sheet
  }

  const sheet = ref(resolveStylesheet())

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

  return {
    sheet,
    toString,
  }
}
