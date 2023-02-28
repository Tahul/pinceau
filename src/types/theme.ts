import type { GeneratedPinceauPaths, GeneratedPinceauTheme, theme } from '#pinceau/theme'
import type { GeneratedPinceauUtils } from '#pinceau/utils'

export type PinceauTheme = GeneratedPinceauTheme extends undefined ? {} : GeneratedPinceauTheme

export type PinceauTokensPaths = GeneratedPinceauPaths extends undefined ? '' : GeneratedPinceauPaths

export type PinceauUtils = GeneratedPinceauUtils extends undefined ? { [key: string]: any } : GeneratedPinceauUtils

export type PinceauMediaQueries = 'dark' | 'light' | 'initial' | keyof (typeof theme.media)
