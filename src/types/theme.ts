import type { ConfigTokens } from './config'
import type { PinceauTokens } from './tokens'
// @ts-ignore
import type { GeneratedPinceauTheme, GeneratedTokensPaths } from '#pinceau/types'

export interface PinceauTheme extends GeneratedPinceauTheme, Omit<ConfigTokens, keyof GeneratedPinceauTheme>, PinceauTokens {}

export type PinceauTokensPaths = GeneratedTokensPaths
