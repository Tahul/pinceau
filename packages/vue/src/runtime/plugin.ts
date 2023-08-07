import type { PinceauRuntimePluginOptions, Variants } from '@pinceau/runtime'
import { defaultRuntimeOptions, usePinceauRuntimeSheet, usePinceauThemeSheet } from '@pinceau/runtime'
import { nanoid } from 'nanoid'
import { getCurrentInstance } from 'vue'
import type { ComputedRef, Plugin } from 'vue'

export const PinceauPlugin: Plugin = {
  install(
    app,
    options: PinceauRuntimePluginOptions,
  ) {
    // Overrides defaults with given options
    options = Object.assign(defaultRuntimeOptions, options)
    const { theme, tokensHelperConfig, multiApp, colorSchemeMode, utils } = options

    // Resolve theme sheet
    const themeSheet = usePinceauThemeSheet(theme, tokensHelperConfig, colorSchemeMode)

    // Sets a unique id for this plugin instance, as Pinceau can be used in multiple apps at the same time.
    const appId = multiApp ? nanoid(6) : undefined

    // Creates the runtime stylesheet.
    const runtimeSheet = usePinceauRuntimeSheet(themeSheet.$tokens, utils, colorSchemeMode, appId)

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

      return { $pinceau: '', instance }
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
