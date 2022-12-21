import type { GeneratedPinceauPaths, GeneratedPinceauTheme } from '#pinceau/theme'
import type { GeneratedPinceauUtils } from '#pinceau/utils'

export type NativeMediaQueries = 'dark' | 'light' | 'initial'

export type PinceauTheme = GeneratedPinceauTheme

export type PinceauTokensPaths = GeneratedPinceauPaths

export type PinceauUtils = GeneratedPinceauUtils

// @ts-ignore - Might be undefined
export type PinceauMediaQueries = keyof PinceauTheme['media'] extends undefined ? NativeMediaQueries : NativeMediaQueries | keyof PinceauTheme['media']
