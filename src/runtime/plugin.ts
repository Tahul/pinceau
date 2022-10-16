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

    const { get, update } = usePinceauStylesheet(state, $tokens, multiAppId)

    const setupPinceauRuntime = (
      _props: any,
      variants: any,
      computedStyles: any,
    ) => {
      const instance = getCurrentInstance()

      const instanceId = (instance?.vnode?.type as any)?.__scopeId || 'data-v-unknown'

      const instanceUid = instance?.uid?.toString?.() || '0'

      const props = computed(() => {
        return _props
      })

      const variantsPropsValues = computed(() => sanitizeProps(props.value, variants.value))

      const css = computed(() => props.value?.css)

      const ids = computed(
        () => getIds(
          instanceId,
          instanceUid,
          css.value,
          variants.value,
        ),
      )

      const push = (_ids = ids.value) => {
        state.push(
          _ids,
          variants.value,
          variantsPropsValues.value,
          css.value,
          computedStyles,
        )
      }

      watch([variantsPropsValues, css], () => push(ids.value), { immediate: true })

      onScopeDispose(() => state.drop(ids.value))

      const $pinceau = computed(() => [ids.value.variantsClassName, ids.value.uniqueClassName].filter(Boolean).join(' '))

      return { $pinceau, push }
    }

    app.config.globalProperties.$pinceauRuntime = setupPinceauRuntime
    app.config.globalProperties.$pinceauSsr = { getStylesheetContent: get, updateStylesheet: update }
    app.provide('pinceauRuntime', setupPinceauRuntime)
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
