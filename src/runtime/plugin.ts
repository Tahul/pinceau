import type { Plugin, PropType } from 'vue'
import { computed, getCurrentInstance, onScopeDispose, watch } from 'vue'
import { defu } from 'defu'
import { nanoid } from 'nanoid'
import type { CSS, PinceauTheme } from '../types'
import { createTokensHelper, getIds, sanitizeProps } from './utils'
import { usePinceauRuntimeState } from './state'
import { usePinceauStylesheet } from './stylesheet'

export const plugin: Plugin = {
  install(app, { theme, helpersConfig, multiApp = false }) {
    theme = defu(theme || {}, { theme: {}, aliases: {} })

    helpersConfig = defu(helpersConfig, { flattened: true })

    const multiAppId = multiApp ? nanoid(6) : undefined

    const $tokens = createTokensHelper(theme.theme, theme.aliases, helpersConfig)

    const state = usePinceauRuntimeState()

    const { getStylesheetContent, updateStylesheet } = usePinceauStylesheet(state, $tokens, multiAppId)

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

      return { $variantsClass }
    }

    app.config.globalProperties.$pinceau = setupPinceauRuntime
    app.config.globalProperties.$pinceauSsr = { getStylesheetContent, updateStylesheet }
    app.provide('pinceau', setupPinceauRuntime)
  },
}

/**
 * A prop to be used on any component to enable `:css` prop.
 */
export const cssProp = {
  type: Object as PropType<CSS<PinceauTheme, {}, {}, false>>,
  required: false,
  default: undefined,
}
