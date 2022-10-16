import { ref, watch } from 'vue'
import type { TokensFunction } from '../types'
import { resolveCssProperty, stringify, transformStateToDeclaration } from './utils'

export function usePinceauStylesheet(state: any, $tokens: TokensFunction, appId?: string) {
  const declaration = ref({})

  const stylesheet = ref<any>()

  const declarationToCss = () => stringify(declaration.value, (property: any, value: any, style: any, selectors: any) => resolveCssProperty(property, value, style, selectors, $tokens))

  const resolveStylesheet = () => {
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

    return style
  }

  const writeStylesheet = (stylesheet: any, content: string) => {
    if (!content || !stylesheet) { return }
    if (content !== stylesheet.textContent) { stylesheet.textContent = content }
  }

  watch(
    [state.variants, state.props, state.computedStyles],
    (newState, oldState) => {
      if (!newState || newState === oldState) { return }

      stylesheet.value = resolveStylesheet()

      declaration.value = transformStateToDeclaration(newState[0], newState[1], newState[2])
    },
    {
      immediate: true,
    },
  )

  watch(
    declaration,
    (newDecl, oldDecl) => {
      if (newDecl === oldDecl) { return }
      writeStylesheet(stylesheet.value, declarationToCss())
    },
  )

  return {
    get: () => declarationToCss(),
    update: writeStylesheet,
  }
}
