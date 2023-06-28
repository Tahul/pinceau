import type { PinceauRuntimePluginOptions } from '@pinceau/shared'

export { usePinceauRuntimeSheet } from './features/stylesheet'
export { usePinceauRuntimeIds } from './ids'
export { usePinceauThemeSheet } from './features/theme'
export { usePinceauComputedStyle } from './features/computedStyles'
export { usePinceauVariants } from './features/variants'
export { usePinceauCssProp } from './features/cssProp'

export const defaultRuntimeOptions: PinceauRuntimePluginOptions = {
  theme: {},
  utils: {},
  tokensHelperConfig: {},
  multiApp: false,
  colorSchemeMode: 'media',
  dev: process.env.NODE_ENV !== 'production',
}
