import { useRuntimeSheet, useThemeSheet } from '@pinceau/runtime'

export const PinceauSvelteOptions = { dev: true, colorSchemeMode: 'media', computedStyles: true, variants: true, ssr: { theme: true, runtime: true }, appId: false }

let userOptions

let themeSheet

let runtimeSheet

export const getRuntimeSheet = () => runtimeSheet

export const getThemeSheet = () => themeSheet

export function pinceauPlugin(options) {
  userOptions = { ...PinceauSvelteOptions, ...options }
  themeSheet = useThemeSheet(userOptions)
  runtimeSheet = useRuntimeSheet({ themeSheet, ...userOptions })
}

export const ssr = { toString: () => runtimeSheet.toString() }
