export const IS_BROWSER = typeof window !== 'undefined' && 'HTMLElement' in window

/**
 * Returns a usable stylesheet in both server/runtime contexts.
 */
export function useStyleSheet(
  id: string,
  root?: Document | any,
) {
  let sheet: CSSStyleSheet

  if (IS_BROWSER) {
    sheet = (((root || document) as Document).getElementById(id) as HTMLStyleElement).sheet as CSSStyleSheet
    if (!sheet) { throw new Error(`Could not find stylesheet with id #${id}!`) }
  }
  else {
    sheet = getSSRStylesheet()
  }

  return sheet
}

/**
 * Returns a SSR-compatible version of a CSSStylesheet.
 *
 * To be used server-side to create the stringifiable sheet.
 */
export function getSSRStylesheet() {
  return {
    cssRules: [],
    insertRule(cssText: string, index?: number) {
      index = typeof index === 'undefined' ? this.cssRules.length : index
      this.cssRules.splice(index, 1, { cssText } as CSSRule)
      return index
    },
    deleteRule(index: number) { delete this.cssRules[index] },
  } as any as CSSStyleSheet
}
