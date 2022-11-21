import type { DesignToken, PinceauTokens } from './tokens'

export interface ShadowTokenValue {
  color?: string
  type?: 'dropShadow' | 'innerShadow'
  x?: string | number
  y?: string | number
  blur?: string | number
  spread?: string | number
}

export interface ScaleTokens extends PinceauTokens {
  [key: string]: {
    default?: DesignToken
    50?: DesignToken
    100?: DesignToken
    200?: DesignToken
    300?: DesignToken
    400?: DesignToken
    500?: DesignToken
    600?: DesignToken
    700?: DesignToken
    800?: DesignToken
    900?: DesignToken
  } | DesignToken | string
}

export interface BreakpointsTokens extends PinceauTokens {
  '2xs'?: DesignToken
  xs?: DesignToken
  sm?: DesignToken
  md?: DesignToken
  lg?: DesignToken
  xl?: DesignToken
  '2xl'?: DesignToken
  '3xl'?: DesignToken
  '4xl'?: DesignToken
  '5xl'?: DesignToken
  '6xl'?: DesignToken
  '7xl'?: DesignToken
}

export interface FontWeightTokens extends PinceauTokens {
  thin?: DesignToken
  extraLight?: DesignToken
  light?: DesignToken
  regular?: DesignToken
  medium?: DesignToken
  semiBold?: DesignToken
  bold?: DesignToken
  extraBold?: DesignToken
  black?: DesignToken
  heavyBlack?: DesignToken
}

export interface ConfigSuggestion {
  colors?: ScaleTokens | PinceauTokens
  fonts?: PinceauTokens
  fontWeights?: FontWeightTokens | PinceauTokens
  fontSizes?: BreakpointsTokens | PinceauTokens
  size?: BreakpointsTokens | PinceauTokens
  space?: BreakpointsTokens | PinceauTokens
  radii?: BreakpointsTokens | PinceauTokens
  borders?: BreakpointsTokens | PinceauTokens
  borderWidths?: BreakpointsTokens | PinceauTokens
  borderStyles?: BreakpointsTokens | PinceauTokens
  shadows?: BreakpointsTokens | PinceauTokens
  opacity?: BreakpointsTokens | PinceauTokens
  leads?: BreakpointsTokens | PinceauTokens
  letterSpacings?: BreakpointsTokens | PinceauTokens
  transitions?: PinceauTokens | PinceauTokens
  zIndices?: PinceauTokens | PinceauTokens
}
