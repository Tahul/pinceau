import type { PinceauMediaQueries, PinceauTheme, Theme, TokensFunction } from '@pinceau/theme'
import type { PinceauUidTypes } from './ids'
import type { CachedCSSRule } from './rules'

/**
 * usePinceauRuntilmeSheet exposed interface.
 */
export interface PinceauRuntimeSheet {
  sheet: CSSStyleSheet | undefined
  cache: { [key: string]: CachedCSSRule }
  stringify: (decl: any, loc?: any) => string
  pushDeclaration: (uid: string, type: PinceauUidTypes, declaration: any, previousRule?: any, loc?: any) => CSSRule | undefined
  deleteRule: (rule: CSSRule) => void
  toString: () => string
  hydratableRules?: { [key: string]: { [uid: string]: CSSRule | undefined } } | undefined
}

/**
 * usePinceauThemeSheet exposed interface.
 */
export interface PinceauThemeSheet {
  theme: PinceauTheme
  $tokens: TokensFunction
  updateToken: (path: string | string[], value: any, mq: PinceauMediaQueries) => void
  updateTheme: (value: Theme<PinceauTheme>) => void
  resolveStylesheet: () => void
}
