import { useStylesheet } from '$pinceau/runtime'

export const PinceauVueOptions = { computedStyles: true, cssProp: true, variants: true, colorSchemeMode: 'media', dev: true }

export const PinceauVue = {
  install(app) {
    const themeSheet = useStylesheet('#pinceau-theme')
    const runtimeSheet = useStylesheet('#pinceau-runtime')

    // Inject/provide for composables access
    app.provide('pinceauThemeSheet', themeSheet)
    app.provide('pinceauRuntimeSheet', runtimeSheet)
  },
}
