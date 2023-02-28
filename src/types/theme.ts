import type { GeneratedPinceauPaths, GeneratedPinceauTheme } from '#pinceau/theme'
import type { GeneratedPinceauUtils } from '#pinceau/utils'

export type PinceauTheme = GeneratedPinceauTheme extends undefined ? {} : GeneratedPinceauTheme

export type PinceauTokensPaths = GeneratedPinceauPaths extends undefined ? '' : GeneratedPinceauPaths

export type PinceauUtils = GeneratedPinceauUtils extends undefined ? { [key: string]: any } : GeneratedPinceauUtils

export type PinceauMediaQueries = 'dark' | 'light' | 'initial' | (PinceauTheme['media'] extends undefined ? never : keyof PinceauTheme['media'])
