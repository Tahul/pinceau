import type { DesignToken, PinceauTheme, Theme, ThemeFunction } from '@pinceau/theme'
import type { PinceauRuntimePluginOptions } from './plugin'

export interface PinceauThemeSheetOptions extends PinceauRuntimePluginOptions {
  theme?: Theme<PinceauTheme>
  hydrate?: boolean
}

export interface PinceauThemeSheet {
  sheet: CSSStyleSheet
  cache: { [key: string]: CSSMediaRule }
  theme: Theme<PinceauTheme>
  $theme: ThemeFunction
  formatToken: (
    path: string | string[],
    value: any,
    variable: string,
    mq?: string,
  ) => DesignToken
  hydrate: (cssRules?: CSSRuleList) => void
}

export interface PinceauRuntimeSheetOptions extends PinceauRuntimePluginOptions {
  themeSheet?: PinceauThemeSheet
  hydrate?: boolean
}

export interface PinceauRuntimeSheet {
  sheet: CSSStyleSheet
  cache: Map<string, { rule: CSSRule; members: number }>
  getRule: (declaration: any, previousRule?: string, useClass?: boolean) => string | undefined
  deleteRule: (rule: string) => void
  deleteMember: (className: string) => { rule: CSSRule; members: number } | void
  flush: (members?: number, key?: string) => { rule: CSSRule; members: number }[]
  hydrate: (cssRules?: CSSRuleList) => void
  toString: () => string
}
