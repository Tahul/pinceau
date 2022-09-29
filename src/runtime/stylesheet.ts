import { computed, watch } from 'vue'
import type { TokensFunction } from '../types'
import { resolveCssProperty, stringify, transformStateToDeclaration } from './utils'

export function usePinceauStylesheet(state: any, $tokens: TokensFunction) {
  const declaration = computed(() => transformStateToDeclaration(state.variantsState, state.propsState, state.computedStylesState))

  const getStylesheetContent = () => stringify(declaration.value, (property: any, value: any, style: any, selectors: any) => resolveCssProperty(property, value, style, selectors, $tokens))

  const updateStylesheet = () => {
    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window
    if (global && global.document) {
      const doc = global.document
      let style = doc.querySelector('style#pinceau')
      if (!style) {
        const styleTag = doc.createElement('style')
        styleTag.id = 'pinceau'
        styleTag.type = 'text/css'
        doc.head.append(styleTag)
        style = styleTag
      }
      const content = getStylesheetContent()
      style.textContent = content
    }
  }

  watch(declaration, () => updateStylesheet(), { immediate: true })

  return {
    updateStylesheet,
    getStylesheetContent,
  }
}
