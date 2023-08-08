import type { PinceauRuntimePluginOptions } from './types'

export { useRuntimeSheet } from './runtime-sheet'
export { getRuntimeIds } from './ids'
export { useThemeSheet } from './theme-sheet'

export * from './types'

export const defaultRuntimeOptions: PinceauRuntimePluginOptions = {
  theme: {},
  utils: {},
  appId: false,
  colorSchemeMode: 'media',
}
