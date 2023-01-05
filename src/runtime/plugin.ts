import type { ComputedRef, Plugin, Ref } from 'vue'
import { computed, getCurrentInstance, ref } from 'vue'
import { nanoid } from 'nanoid'
import type { PinceauRuntimePluginOptions } from 'pinceau/types'
import { usePinceauRuntimeSheet } from './features/stylesheet'
import { usePinceauRuntimeIds } from './ids'
import { usePinceauThemeSheet } from './features/theme'
import { usePinceauComputedStyles } from './features/computedStyles'
import { usePinceauVariants } from './features/variants'
import { usePinceauCssProp } from './features/cssProp'

const defaultRuntimeOptions: PinceauRuntimePluginOptions = {
  theme: {},
  utils: {},
  tokensHelperConfig: {},
  multiApp: false,
  colorSchemeMode: 'media',
  dev: process.env.NODE_ENV !== 'production',
}

export const plugin: Plugin = {
  install(
    app,
    options: PinceauRuntimePluginOptions,
  ) {
    // Overrides defaults with given options
    options = Object.assign(defaultRuntimeOptions, options)
    const { theme, tokensHelperConfig, dev, multiApp, colorSchemeMode, utils } = options

    // Resolve theme sheet
    const themeSheet = usePinceauThemeSheet(theme)

    // Runtime debug setup:
    if (dev && (import.meta.hot || (process as any).server)) {
      import('./features/debug').then(({ usePinceauRuntimeDebug }) => {
        usePinceauRuntimeDebug(tokensHelperConfig)
      })
    }

    // Sets a unique id for this plugin instance, as Pinceau can be used in multiple apps at the same time.
    const multiAppId = multiApp ? nanoid(6) : undefined

    // Creates the runtime stylesheet.
    const runtimeSheet = usePinceauRuntimeSheet(themeSheet.$tokens, utils, colorSchemeMode, multiAppId)

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

      // Component LOC for debug in development
      // Only LOC variable passing should stay in bundle
      let loc: any
      if (dev && (import.meta.hot || (process as any).server)) {
        // @ts-ignore
        const { __file: file, __name: name } = instance.vnode.type
        loc = { file, name }
      }

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
      if (computedStyles && computedStyles?.value && Object.keys(computedStyles.value).length > 0) { usePinceauComputedStyles(ids, computedStyles, runtimeSheet, loc) }

      // Variants setup
      if (variants && variants?.value && Object.keys(variants.value).length > 0) { usePinceauVariants(ids, variants, props, runtimeSheet, classes, loc) }

      // CSS Prop setup
      if (props.value.css && Object.keys(props.value.css).length > 0) { usePinceauCssProp(ids, props, runtimeSheet, loc) }

      return {
        $pinceau: computed(() => `${classes.value.v} ${classes.value.c}`),
      }
    }

    // Install global variables, expose `runtimeSheet.toString()` for SSR
    app.config.globalProperties.$pinceauRuntime = usePinceauRuntime
    app.config.globalProperties.$pinceauTheme = themeSheet
    app.config.globalProperties.$pinceauSsr = { get: () => runtimeSheet.toString() }

    // Inject/provide for composables access
    app.provide('pinceauRuntime', usePinceauRuntime)
    app.provide('pinceauTheme', themeSheet)
  },
}
