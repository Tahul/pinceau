import type { GeneratedPinceauMediaQueries, GeneratedPinceauTheme, GeneratedPinceauThemePaths } from '$pinceau/theme'
import type { GeneratedPinceauUtils } from '$pinceau/utils'

export { version } from '../package.json'

export * from './define-theme'

declare global {
  export type PinceauTheme = GeneratedPinceauTheme
  export type PinceauPaths = GeneratedPinceauThemePaths
  export type PinceauMediaQueries = GeneratedPinceauMediaQueries
  export type PinceauUtils = GeneratedPinceauUtils
}
