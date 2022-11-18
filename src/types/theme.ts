// @ts-ignore
import type { ConfigTokens } from './config'
import type { PinceauTokens } from './tokens'
import type { GeneratedPinceauTheme, GeneratedTokensPaths } from '#pinceau/types'

export interface PinceauTheme extends GeneratedPinceauTheme, Omit<ConfigTokens, keyof GeneratedPinceauTheme>, PinceauTokens {}

export type PinceauThemePaths = GeneratedTokensPaths
