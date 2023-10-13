import React, { createContext, useContext } from 'react'
  import { useThemeSheet, useRuntimeSheet } from '@pinceau/runtime'

  export const PinceauReactOptions = {"dev":true,"colorSchemeMode":"media","computedStyles":true,"variants":true,"ssr":{"theme":true,"runtime":true},"appId":false}

  const PinceauContext = createContext()

  export const usePinceauContext = () => useContext(PinceauContext)

  export const PinceauProvider = ({ options, children }) => {
    const userOptions = { ...PinceauReactOptions, ...options }

    const themeSheet = useThemeSheet(userOptions)
    const runtimeSheet = useRuntimeSheet({ themeSheet, ...userOptions })
    const ssr = { toString: () => runtimeSheet.toString() }

    return React.createElement(PinceauContext.Provider, {  value: { themeSheet, runtimeSheet, ssr }, children })
  }
