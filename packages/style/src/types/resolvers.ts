import type { DefaultThemeMap, PinceauTokensPaths } from '@pinceau/theme'
import type { NativeProperties } from './properties'
import type * as Utils from './format-utils'

/**
 * Takes a supported key from the ThemeMap and returns a list of tokens supporting that key.
 */
export type ThemeProperties<K extends keyof DefaultThemeMap> = Utils.WrapUnion<Utils.FilterStartingWith<PinceauTokensPaths, DefaultThemeMap[K]>, '{', '}'>

/**
 * Take a key and gives a list of tokens under that key in configuration.
 */
export type ThemeTokens<K extends PinceauTokensPaths | (string & object)> = Utils.WrapUnion<Utils.FilterStartingWith<PinceauTokensPaths, K>, '{', '}'>

/**
 * Supported properties in `css()` function
 */
export type SupportedProperties = keyof NativeProperties | keyof DefaultThemeMap

/**
 * CSS properties suggested values resolver.
 */
export type PropertyValue<T extends (keyof NativeProperties | keyof DefaultThemeMap | string | number)> =
  // Check if current property is a native CSS key
  T extends keyof NativeProperties ?
    // Check if that key is handled in the ThemeMap
    T extends keyof DefaultThemeMap ?
      // Theme key supported; return tokens + MDN data
      ThemeProperties<T> | NativeProperties[T] :
      // Only return MDN data
      NativeProperties[T]
    : never

export type UsableTokens = Utils.WrapUnion<PinceauTokensPaths, '{', '}'>