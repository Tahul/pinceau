export const pluginTypes = {
  imports: [
    'import type { ThemeFunction } from \'@pinceau/theme\'',
    'import type { PinceauTheme as GeneratedPinceauTheme, PinceauMediaQueries as GeneratedPinceauMediaQueries, PinceauThemePaths as GeneratedPinceauThemePaths } from \'@pinceau/outputs/theme\'',
    'import type { PinceauUtils as GeneratedPinceauUtils } from \'@pinceau/outputs/utils\'',
  ],
  global: [
    'export const $theme: ThemeFunction',
    'export type PinceauTheme = GeneratedPinceauTheme',
    'export type PinceauUtils = GeneratedPinceauUtils',
    'export type PinceauMediaQueries = GeneratedPinceauMediaQueries',
    'export type PinceauThemePaths = GeneratedPinceauThemePaths',
  ],
  exports: [
    'GeneratedPinceauTheme as PinceauTheme',
    'GeneratedPinceauUtils as PinceauUtils',
    'GeneratedPinceauMediaQueries as PinceauMediaQueries',
    'GeneratedPinceauThemePaths as PinceauThemePaths',
  ],
}
