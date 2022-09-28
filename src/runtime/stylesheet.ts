import { computed, watch } from 'vue'
import type { TokensFunction } from '../types'
import { resolveCssProperty, stringify, transformVariantsAndPropsToDeclaration } from './utils'

export function usePinceauStylesheet(state: any, $tokens: TokensFunction) {
  const declaration = computed(() => transformVariantsAndPropsToDeclaration(state.variantsState, state.propsState))

  const getStylesheetContent = () => stringify(declaration.value, (property: any, value: any, style: any, selectors: any) => resolveCssProperty(property, value, style, selectors, $tokens))

  const updateStylesheet = () => {
    // Only update stylesheet on client-side
    // SSR Rendering occurs in `app:rendered` hook, or via `getStylesheetContent`
    const global = globalThis || window
    if (global && global.document) {
      const doc = global.document
      const content = getStylesheetContent()
      let style = doc.querySelector('style#pinceau')
      if (!style) {
        const styleTag = doc.createElement('style')
        styleTag.id = 'pinceau'
        doc.head.prepend(styleTag)
        style = styleTag
      }
      style.textContent = content
    }
  }

  watch(declaration, () => updateStylesheet())

  return {
    updateStylesheet,
    getStylesheetContent,
  }
}
