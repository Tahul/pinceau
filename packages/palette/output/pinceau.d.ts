import type { ThemeFunction } from '@pinceau/theme'
import type { PinceauTheme as GeneratedPinceauTheme, PinceauMediaQueries as GeneratedPinceauMediaQueries, PinceauThemePaths as GeneratedPinceauThemePaths } from './theme'
import type { PinceauUtils as GeneratedPinceauUtils } from './utils.ts'
import type { SupportedHTMLElements } from '@pinceau/style'
import type { CSSFunctionArg } from '@pinceau/style'
import type { StyledFunctionArg } from '@pinceau/style'
import type { ThemeTokens } from '@pinceau/style'

declare global {
  export const $theme: ThemeFunction
  export type PinceauTheme = GeneratedPinceauTheme
  export type PinceauUtils = GeneratedPinceauUtils
  export type PinceauMediaQueries = GeneratedPinceauMediaQueries
  export type PinceauThemePaths = GeneratedPinceauThemePaths
  export const css: ((declaration: CSSFunctionArg) => string)
  export const styled: (<Props extends {} = {}>(declaration: StyledFunctionArg<Props>) => string)
  export type ThemeTokens<T extends PinceauThemePaths & (string & {}) = PinceauThemePaths & (string & {})> = PinceauThemeTokens<T>
}

export {}
