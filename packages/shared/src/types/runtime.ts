import type { Theme } from './config'
import type { ColorSchemeModes } from './css'
import type { TokensFunction, TokensFunctionOptions } from './dt'
import type { PinceauMediaQueries, PinceauTheme } from './theme'

export interface PinceauRuntimeIds {
  uid: string
  componentId: string
  uniqueClassName?: string
}

export interface CachedCSSRule {
  count: number
  variantClass?: string
  classes?: string[]
  rule: CSSRule
}

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
  $tokens: TokensFunction
  updateToken: (path: string | string[], value: any, mq: PinceauMediaQueries) => void
  updateTheme: (value: Theme<PinceauTheme>) => void
  resolveStylesheet: () => void
  theme: Theme<PinceauTheme>
}

export interface PinceauRuntimePluginOptions {
  /**
   * Initial theme.
   *
   * It does not need to be passed as it will be resolved at runtime from the associated stylesheet.
   */
  theme?: any
  /**
   * Utils functions coming from `#pinceau/utils` import.
   */
  utils?: any
  /**
   * Toggles the multi-app mode.
   */
  multiApp: false
  /**
   * Toggles development mode for runtime plugin.
   */
  dev: boolean
  /**
   * Tokens resolver options.
   */
  tokensHelperConfig: TokensFunctionOptions
  /**
   * Color scheme mode to be used by runtime plugin.
   */
  colorSchemeMode: ColorSchemeModes
}

export type PinceauUidTypes =
  /* Variants */
  | 'v'
  /* Computed Styles */
  | 'c'
  /* CSS Prop */
  | 'p'
