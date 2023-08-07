import type { PinceauRuntimePluginOptions } from './types'

export { usePinceauRuntimeSheet } from './stylesheet'
export { usePinceauRuntimeIds } from './ids'
export { usePinceauThemeSheet } from './theme'
export { usePinceauComputedStyle } from './computedStyles'
export { usePinceauVariants } from './variants'
export { usePinceauCssProp } from './cssProp'

export * from './types'

export const defaultRuntimeOptions: PinceauRuntimePluginOptions = {
  theme: {},
  utils: {},
  tokensHelperConfig: {},
  multiApp: false,
  colorSchemeMode: 'media',
}
