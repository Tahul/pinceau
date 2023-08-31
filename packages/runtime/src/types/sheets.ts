import type { Theme, ThemeFunction } from '@pinceau/theme'

export interface PinceauThemeSheetOptions {
  theme?: Theme<PinceauTheme>
  hydrate?: boolean
}

export interface PinceauThemeSheet {
  sheet: CSSStyleSheet
  cache: { [key: string]: CSSMediaRule }
  theme: Theme<PinceauTheme>
  $theme: ThemeFunction
  hydrate: (cssRules: any) => void
}

export interface PinceauRuntimeSheetOptions {
  themeSheet?: PinceauThemeSheet
  hydrate?: boolean
}

export interface PinceauRuntimeSheet {
  sheet: CSSStyleSheet
  cache: { [key: string]: CSSMediaRule }
  hydrate: (cssRules: any) => void
  toString: () => string
}
