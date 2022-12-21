import type { ComputedRef, Plugin, Ref } from 'vue'
import { computed, getCurrentInstance, ref } from 'vue'
import { nanoid } from 'nanoid'
import { createTokensHelper } from './utils'
import { usePinceauRuntimeSheet } from './features/stylesheet'
import { usePinceauRuntimeIds } from './ids'
import { usePinceauThemeSheet } from './features/theme'
import { usePinceauComputedStyles } from './features/computedStyles'
import { usePinceauVariants } from './features/variants'
import { usePinceauCssProp } from './features/cssProp'

export const plugin: Plugin = {
  install(
    app,
    {
      theme = {},
      utils = {},
      tokensHelperConfig = {},
      multiApp = false,
      colorSchemeMode = 'media',
      dev = process.env.NODE_ENV !== 'production',
    },
  ) {
    // Resolve theme sheet
    const themeSheet = usePinceauThemeSheet(theme)

    // Tokens helper
    const $tokens = createTokensHelper(
      themeSheet.theme,
      Object.assign(
        {
          key: 'variable',
        },
        tokensHelperConfig,
      ),
    )

    // Sets a unique id for this plugin instance, as Pinceau can be used in multiple apps at the same time.
    const multiAppId = multiApp ? nanoid(6) : undefined

    // Creates the runtime stylesheet.
    const runtimeSheet = usePinceauRuntimeSheet($tokens, utils, colorSchemeMode, multiAppId)

    /**
     * Setup Pinceau runtime from a component.
     *
     * Will be automatically added to components that use one of the Pinceau runtime features.
     */
    function usePinceauRuntime(
      props: ComputedRef<any>,
      variants: Ref<any>,
      computedStyles: Ref<any>,
    ) {
      // Current component instance
      const instance = getCurrentInstance()

      // Current component classes
      const classes = ref({
        // Variants class
        v: '',
        // Unique class
        c: '',
      })

      // Component ids and classes with persisted uid
      const ids = usePinceauRuntimeIds(instance, classes, dev)

      // Computed styles setup
      if (computedStyles && computedStyles?.value && Object.keys(computedStyles.value).length > 0) { usePinceauComputedStyles(ids, computedStyles, runtimeSheet) }

      // Variants setup
      if (variants && variants?.value && Object.keys(variants.value).length > 0) { usePinceauVariants(ids, variants, props, runtimeSheet, classes) }

      // CSS Prop setup
      if (props.value.css && Object.keys(props.value.css).length > 0) { usePinceauCssProp(ids, props, runtimeSheet) }

      return {
        $pinceau: computed(() => `${classes.value.v} ${classes.value.c}`),
      }
    }

    // Install global variables, expose `runtimeSheet.toString()` for SSR
    app.config.globalProperties.$pinceauRuntime = usePinceauRuntime
    app.config.globalProperties.$pinceauSsr = { get: () => runtimeSheet.toString() }
    app.provide('pinceauRuntime', usePinceauRuntime)
    app.provide('pinceauTheme', themeSheet)
  },
}
