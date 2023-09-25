import type { ThemeFunction } from './types'
import type { GeneratedPinceauMediaQueries, GeneratedPinceauTheme, GeneratedPinceauThemePaths } from '$pinceau/theme'
import type { GeneratedPinceauUtils } from '$pinceau/utils'

export * from './types'

export { version } from '../package.json'

declare global {
  export const $theme: ThemeFunction
  export type PinceauTheme = GeneratedPinceauTheme
  export type PinceauPaths = GeneratedPinceauThemePaths
  export type PinceauMediaQueries = GeneratedPinceauMediaQueries
  export type PinceauUtils = GeneratedPinceauUtils
}
