import type { PinceauTokens, TokenKey } from './tokens'

export interface ScaleTokens extends PinceauTokens {
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

export interface BreakpointsTokens extends PinceauTokens {
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

export interface FontWeightTokens extends PinceauTokens {
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
  color?: ScaleTokens | PinceauTokens
  font?: PinceauTokens
  fontWeight?: FontWeightTokens | PinceauTokens
  fontSize?: BreakpointsTokens | PinceauTokens
  size?: BreakpointsTokens | PinceauTokens
  space?: BreakpointsTokens | PinceauTokens
  radii?: BreakpointsTokens | PinceauTokens
  border?: BreakpointsTokens | PinceauTokens
  borderWidth?: BreakpointsTokens | PinceauTokens
  borderStyle?: BreakpointsTokens | PinceauTokens
  shadow?: BreakpointsTokens | PinceauTokens
  opacity?: BreakpointsTokens | PinceauTokens
  lead?: BreakpointsTokens | PinceauTokens
  letterSpacing?: BreakpointsTokens | PinceauTokens
  transition?: PinceauTokens | PinceauTokens
  zIndex?: PinceauTokens | PinceauTokens
}
