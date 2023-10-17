import { useRuntimeSheet, useThemeSheet } from '@pinceau/runtime'

export const PinceauReactOptions = { dev: false, colorSchemeMode: 'media', computedStyles: true, variants: true, ssr: { theme: true, runtime: true }, appId: false }

export const PinceauContext = React.createContext()

export const usePinceauContext = () => React.useContext(PinceauContext)

export function PinceauProvider({ options, children, cb }) {
  const userOptions = { ...PinceauReactOptions, ...options }

  const themeSheet = useThemeSheet(userOptions)
  const runtimeSheet = useRuntimeSheet({ themeSheet, ...userOptions })

  const ssr = { toString: () => runtimeSheet.toString() }

  if (cb) { cb(ssr) }

  return React.createElement(PinceauContext.Provider, { value: { themeSheet, runtimeSheet, ssr }, children })
}
