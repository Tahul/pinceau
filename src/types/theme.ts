// @ts-ignore
import type { GeneratedCustomProperties, GeneratedPinceauTheme, GeneratedTokensPaths } from '#pinceau/types'

export type NativeMediaQueries = 'dark' | 'light' | 'initial'

export type PinceauTheme = GeneratedPinceauTheme

export type PinceauTokensPaths = GeneratedTokensPaths

export type PinceauCustomProperties = GeneratedCustomProperties

// @ts-expect-error - Might be undefined
export type PinceauMediaQueries = keyof PinceauTheme['media'] extends undefined ? NativeMediaQueries : NativeMediaQueries | keyof PinceauTheme['media']
