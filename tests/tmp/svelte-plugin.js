import { useThemeSheet, useRuntimeSheet } from '@pinceau/runtime'

  export const PinceauSvelteOptions = {"dev":true,"colorSchemeMode":"media","computedStyles":true,"variants":true,"ssr":{"theme":true,"runtime":true},"appId":false}

  let userOptions

  let themeSheet
export const getRuntimeSheet = () => runtimeSheet

  let runtimeSheet
export const getThemeSheet = () => themeSheet

  export const pinceauPlugin = (options) => {
    userOptions = { ...PinceauSvelteOptions, ...options }
    
    themeSheet = useThemeSheet(userOptions)
    runtimeSheet = useRuntimeSheet({ themeSheet, ...userOptions })
  }

  export const ssr = { toString: () => runtimeSheet.toString() }
