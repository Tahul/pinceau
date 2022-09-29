import type { Plugin, PropType } from 'vue'
import { computed, getCurrentInstance, inject, onScopeDispose, ref, watch } from 'vue'
import { defu } from 'defu'
import type { CSS, PinceauRuntimeIds, PinceauTheme } from '../types'
import { createTokensHelper, getIds, isToken, resolveVariableFromPath, sanitizeProps, transformTokensToVariable } from './utils'
import { usePinceauRuntimeState } from './state'
import { usePinceauStylesheet } from './stylesheet'

export const plugin: Plugin = {
  install(app, { theme, helpersConfig }) {
    theme = defu(theme || {}, { theme: {}, aliases: {} })

    helpersConfig = defu(helpersConfig, { flattened: true })

    const $tokens = createTokensHelper(theme.theme, theme.aliases, helpersConfig)

    const state = usePinceauRuntimeState()

    const { getStylesheetContent, updateStylesheet } = usePinceauStylesheet(state, $tokens)

    const setupPinceauRuntime = (
      props: any,
      variants: any,
      computedStyles: any,
    ) => {
      const instance = getCurrentInstance()

      const variantsPropsValues = computed(() => sanitizeProps(props, variants))

      const css = computed(() => props.css)

      const ids = computed(() => getIds(instance, css.value, variantsPropsValues.value, variants))

      watch(
        ids,
        (ids) => {
          state.push(
            ids,
            variants,
            variantsPropsValues.value,
            css.value,
            computedStyles,
          )
        },
        {
          immediate: true,
        },
      )

      onScopeDispose(() => state.drop(ids.value))

      const $variantsClass = computed(() => [ids.value.className, ids.value.computedClassName].filter(Boolean).join(' '))

      console.log($variantsClass.value)

      return { $variantsClass }
    }

    app.config.globalProperties.$pinceau = setupPinceauRuntime
    app.config.globalProperties.$pinceauSsr = { getStylesheetContent, updateStylesheet }
    app.provide('pinceau', setupPinceauRuntime)
  },
}

export const utils = {
  resolveVariableFromPath,
  transformTokensToVariable,
  isToken,
}

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export const cssProp = {
  type: Object as PropType<CSS<PinceauTheme, {}, {}, false>>,
  required: false,
  default: undefined,
}

/**
 * Entrypoint for Pinceau runtime features.
 */
export function usePinceauRuntime(
  props: any,
  variants: any,
  computedStyles: any,
): void {
  return (inject('pinceau') as any)(props, variants, computedStyles)
}
