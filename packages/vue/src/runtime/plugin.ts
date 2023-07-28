import process from 'node:process'
import type { PinceauRuntimePluginOptions, Variants } from '@pinceau/runtime'
import { defaultRuntimeOptions, usePinceauCssProp, usePinceauRuntimeIds, usePinceauRuntimeSheet, usePinceauThemeSheet, usePinceauVariants } from '@pinceau/runtime'
import { nanoid } from 'nanoid'
import { computed, getCurrentInstance, ref } from 'vue'
import type { ComputedRef, Plugin, Ref } from 'vue'

export const PinceauPlugin: Plugin = {
  install(
    app,
    options: PinceauRuntimePluginOptions,
  ) {
    // Overrides defaults with given options
    options = Object.assign(defaultRuntimeOptions, options)
    const { theme, tokensHelperConfig, dev, multiApp, colorSchemeMode, utils } = options

    // Resolve theme sheet
    const themeSheet = usePinceauThemeSheet(theme, tokensHelperConfig, colorSchemeMode)

    // Runtime debug setup:
    // TODO: Restore runtime debug
    // if (dev && (import.meta.hot || (process as any).server)) { import('./features/debug').then(({ usePinceauRuntimeDebug }) => usePinceauRuntimeDebug(tokensHelperConfig)) }

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
      props: any = {},
      variants: Variants,
      computedStyles: { [key: string]: ComputedRef },
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
      const ids = computed(() => usePinceauRuntimeIds(instance, classes))

      // Computed styles setup
      if (computedStyles && Object.keys(computedStyles).length > 0) { usePinceauComputedStyles(ids, computedStyles, runtimeSheet, loc) }

      // Variants setup
      let dynamicVariantClasses: Ref<string[]>
      if (variants && Object.keys(variants).length > 0) {
        const { variantsClasses } = usePinceauVariants(ids, variants, props, runtimeSheet, classes, loc)
        dynamicVariantClasses = variantsClasses
      }

      // CSS Prop setup
      if (props?.css && Object.keys(props?.css).length > 0) { usePinceauCssProp(ids, props, runtimeSheet, loc) }

      return { $pinceau: computed(() => [classes.value.v, classes.value.c, dynamicVariantClasses?.value?.join(' ')].join(' ')) }
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
