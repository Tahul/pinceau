import { 
  useThemeSheet,
  useRuntimeSheet 
} from '@pinceau/runtime'

export const PinceauVueOptions = {"computedStyles":true,"cssProp":true,"variants":true,"ssr":true,"appId":false,"colorSchemeMode":"media","dev":true}

export const PinceauVue = {
  install(app, options = {}) {
    const _options = { ...PinceauVueOptions, ...options }

    const themeSheet = useThemeSheet(_options)
    app.provide('pinceauThemeSheet', themeSheet)

    const runtimeSheet = useRuntimeSheet({ themeSheet, ..._options })
    app.provide('pinceauRuntimeSheet', runtimeSheet)

    // console.log({ themeSheet, runtimeSheet })

    app.config.globalProperties.$pinceauSSR = { toString: () => runtimeSheet.toString() }
  }
}