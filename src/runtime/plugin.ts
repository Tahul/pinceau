import type { ComputedRef, Plugin, Ref } from 'vue'
import { computed, getCurrentInstance, ref } from 'vue'
import { nanoid } from 'nanoid'
import { deepAssign, deepDelete } from '../utils/deep'
import {
  createTokensHelper,
} from './utils'
import { usePinceauStylesheet } from './stylesheet'
import { usePinceauRuntimeIds } from './ids'
import { usePinceauComputedStyles } from './features/computedStyles'
import { usePinceauVariants } from './features/variants'
import { usePinceauCssProp } from './features/cssProp'

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
    let cache = {}

    tokensHelperConfig = Object.assign({ flattened: true }, tokensHelperConfig)

    const multiAppId = multiApp ? nanoid(6) : undefined

    const $tokens = createTokensHelper(
      theme.theme,
      tokensHelperConfig,
    )

    const sheet = usePinceauStylesheet($tokens, theme.customProperties, colorSchemeMode, multiAppId)

    // Cleanup cache on HMR
    if (import.meta.hot) {
      const applyThemeUpdate = (newTheme: any) => {
        deepAssign(theme, newTheme)
        deepDelete(theme, newTheme)
      }
      import.meta.hot.on(
        'vite:beforeUpdate',
        () => {
          cache = {}
        },
      )
      import.meta.hot.on(
        'pinceau:themeUpdate',
        theme => applyThemeUpdate(theme),
      )
    }

    const setupPinceauRuntime = (
      props: ComputedRef<any>,
      variants: Ref<any>,
      computedStyles: Ref<any>,
    ) => {
      // Current component instance
      const instance = getCurrentInstance()

      // Current component classes
      const classes = ref({
        v: '',
        c: '',
      })

      // Component ids and classes with persisted uid
      const ids = usePinceauRuntimeIds(instance, classes, dev)

      // Computed styles setup
      if (computedStyles && computedStyles?.value && Object.keys(computedStyles.value).length > 0) {
        usePinceauComputedStyles(ids, computedStyles, sheet)
      }

      // Variants setup
      if (variants && variants?.value && Object.keys(variants.value).length > 0) {
        usePinceauVariants(ids, variants, props, sheet, classes, cache)
      }

      // CSS Prop setup
      if (props.value.css && Object.keys(props.value.css).length > 0) {
        usePinceauCssProp(ids, props, sheet)
      }

      return {
        $pinceau: computed(() => `${classes.value.v} ${classes.value.c}`),
      }
    }

    // Install global variables, expose `sheet.toString()` for SSR
    app.config.globalProperties.$pinceauRuntime = setupPinceauRuntime
    app.config.globalProperties.$pinceauSsr = { get: () => sheet.toString() }
    app.provide('pinceauRuntime', setupPinceauRuntime)
  },
}
