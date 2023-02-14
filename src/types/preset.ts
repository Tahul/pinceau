import type { DesignTokens, TokenKey } from './tokens'

export interface ScaleTokens extends DesignTokens {
  [key: string]: TokenKey | {
    default?: TokenKey
    50?: TokenKey
    100?: TokenKey
    200?: TokenKey
    300?: TokenKey
    400?: TokenKey
    500?: TokenKey
    600?: TokenKey
    700?: TokenKey
    800?: TokenKey
    900?: TokenKey
  }
}

export interface BreakpointsTokens extends DesignTokens {
  '2xs'?: TokenKey
  xs?: TokenKey
  sm?: TokenKey
  md?: TokenKey
  lg?: TokenKey
  xl?: TokenKey
  '2xl'?: TokenKey
  '3xl'?: TokenKey
  '4xl'?: TokenKey
  '5xl'?: TokenKey
  '6xl'?: TokenKey
  '7xl'?: TokenKey
}

export interface FontWeightTokens extends DesignTokens {
  thin?: TokenKey
  extraLight?: TokenKey
  light?: TokenKey
  regular?: TokenKey
  medium?: TokenKey
  semiBold?: TokenKey
  bold?: TokenKey
  extraBold?: TokenKey
  black?: TokenKey
  heavyBlack?: TokenKey
}

export interface ConfigSuggestion {
  color?: ScaleTokens | DesignTokens
  font?: DesignTokens
  fontWeight?: FontWeightTokens | DesignTokens
  fontSize?: BreakpointsTokens | DesignTokens
  size?: BreakpointsTokens | DesignTokens
  space?: BreakpointsTokens | DesignTokens
  radii?: BreakpointsTokens | DesignTokens
  border?: BreakpointsTokens | DesignTokens
  borderWidth?: BreakpointsTokens | DesignTokens
  borderStyle?: BreakpointsTokens | DesignTokens
  shadow?: BreakpointsTokens | DesignTokens
  opacity?: BreakpointsTokens | DesignTokens
  lead?: BreakpointsTokens | DesignTokens
  letterSpacing?: BreakpointsTokens | DesignTokens
  transition?: DesignTokens
  zIndex?: DesignTokens
}
