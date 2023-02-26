import type { GeneratedPinceauPaths, GeneratedPinceauTheme, theme } from '#pinceau/theme'
import type { GeneratedPinceauUtils } from '#pinceau/utils'

export type PinceauTheme = GeneratedPinceauTheme extends undefined ? {} : GeneratedPinceauTheme

export type PinceauTokensPaths = GeneratedPinceauPaths extends undefined ? string : GeneratedPinceauPaths

export type PinceauUtils = GeneratedPinceauUtils extends undefined ? {} : GeneratedPinceauUtils

export type PinceauMediaQueries = 'dark' | 'light' | 'initial' | keyof (typeof theme.media)
