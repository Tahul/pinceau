import type { GeneratedPinceauPaths, GeneratedPinceauTheme } from '#pinceau/theme'
import type { GeneratedPinceauUtils } from '#pinceau/utils'

export type PinceauTheme = GeneratedPinceauTheme

export type PinceauTokensPaths = GeneratedPinceauPaths

export type PinceauUtils = GeneratedPinceauUtils

export type PinceauMediaQueries = 'dark' | 'light' | 'initial' | (keyof PinceauTheme['media'] extends string ? keyof PinceauTheme['media'] : never)
