import type { DefaultThemeMap, PinceauThemePaths } from '@pinceau/theme'
import type * as Utils from './format-utils'

/**
 * Takes a supported key from the ThemeMap and returns a list of tokens supporting that key.
 */
export type ThemeProperties<
  K extends string,
> = K extends keyof DefaultThemeMap
  ? Utils.FilterStartingWith<PinceauThemePaths, `$${DefaultThemeMap[K]}`>
  : never

/**
 * Take a key and gives a list of tokens under that key in configuration.
 */
export type ThemeTokens<
  K extends PinceauThemePaths | (string & {}),
> = Utils.FilterStartingWith<PinceauThemePaths, K>
