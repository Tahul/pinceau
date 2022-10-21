import type { Plugin, PropType } from 'vue'
import { computed, getCurrentInstance } from 'vue'
import { nanoid } from 'nanoid'
import type { CSS, PinceauTheme } from '../types'
import {
  createTokensHelper,
  sanitizeProps,
} from './utils'
import { usePinceauStylesheet } from './stylesheet'
import { usePinceauRuntimeIds } from './ids'
import { usePinceauRuntimeFeatures } from './features'

export const plugin: Plugin = {
  install(
    app,
    {
      theme,
      tokensHelperConfig,
      multiApp = false,
      colorSchemeMode = 'media',
      dev = process.env.NODE_ENV !== 'production',
    },
  ) {
    theme = Object.assign({}, theme || {})
    tokensHelperConfig = Object.assign({ flattened: true }, tokensHelperConfig)
    const multiAppId = multiApp ? nanoid(6) : undefined

    const $tokens = createTokensHelper(theme.theme, tokensHelperConfig)

    const sheet = usePinceauStylesheet($tokens, colorSchemeMode, multiAppId)

    const setupPinceauRuntime = (
      props: any,
      variants: any,
      computedStyles: any,
    ) => {
      /**
       * Current component instance
       */
      const instance = getCurrentInstance()

      /**
       * Runtime state
       */
      const variantsProps = computed(() => variants && variants?.value ? sanitizeProps(props, variants.value) : {})
      const css = computed(() => props?.css || undefined)

      /**
       * Component ids and classes with persisted uid
       */
      const ids = usePinceauRuntimeIds(instance, props, variantsProps, dev)

      /**
       * Runtime features registering:
       * Variants, Computed Styles, CSS Prop
       */
      usePinceauRuntimeFeatures(
        ids,
        props,
        variants,
        variantsProps,
        computedStyles,
        css,
        sheet,
      )

      /**
       * Exposed `class` string
       */
      const $pinceau = computed(() => [ids.uniqueClassName, ids.variantsClassName].filter(Boolean).join(' '))

      return { $pinceau }
    }

    app.config.globalProperties.$pinceauRuntime = setupPinceauRuntime
    app.config.globalProperties.$pinceauSsr = {
      get: () => sheet.toString(),
    }
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
