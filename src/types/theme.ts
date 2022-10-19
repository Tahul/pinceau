import type { NativeProperties } from './css'
import type { GeneratedPinceauTheme, GeneratedTokensPaths } from '#pinceau/types'

export interface DesignToken<
  T = string | number | ShadowTokenValue | any,
> {
  /**
   * The raw value of the token.
   */
  value?: T
  /**
   * CSS Variable reference that gets generated out of the token path.
   */
  variable?: string
  /**
   * Some naming for the token.
   */
  name?: string
  /**
   * Some comment to help you remember what this token is used for.
   */
  comment?: string
  /**
   * Is the property live-editable?
   */
  themeable?: boolean
  /**
   * Is the property using palette()?
   */
  palette?: Boolean
  /**
   * The original values (not transformed)
   */
  original?: Omit<DesignToken, 'original'>
  /**
   * Token extraneous attributes.
   */
  attributes?: {
    // If value is a color
    hsl?: string
    rgb?: string
    hex?: string
    variable?: string
    category?: string
    type?: string
    item?: string
    subitem?: string
    state?: string
    [key: string]: any
  }
  /* Permissive type */
  [key: string]: any
}

export interface PinceauTokens {
  [key: string]: PinceauTokens | DesignToken | undefined
}

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
    default?: DesignToken | PinceauTokens
    50?: DesignToken | PinceauTokens
    100?: DesignToken | PinceauTokens
    200?: DesignToken | PinceauTokens
    300?: DesignToken | PinceauTokens
    400?: DesignToken | PinceauTokens
    500?: DesignToken | PinceauTokens
    600?: DesignToken | PinceauTokens
    700?: DesignToken | PinceauTokens
    800?: DesignToken | PinceauTokens
    900?: DesignToken | PinceauTokens
  } | DesignToken
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

export interface ConfigTokens extends PinceauTokens {
  media?: PinceauTokens
  colors?: ScaleTokens
  fonts?: PinceauTokens
  fontWeights?: FontWeightTokens
  fontSizes?: BreakpointsTokens
  size?: BreakpointsTokens
  space?: BreakpointsTokens
  radii?: BreakpointsTokens
  borders?: BreakpointsTokens
  borderWidths?: BreakpointsTokens
  borderStyles?: BreakpointsTokens
  shadows?: BreakpointsTokens
  opacity?: BreakpointsTokens
  leads?: BreakpointsTokens
  letterSpacings?: BreakpointsTokens
  transitions?: PinceauTokens
  zIndices?: PinceauTokens
}

export interface DefaultThemeMap {
  gap: 'space'
  columnGap: 'space'
  rowGap: 'space'
  inset: 'space'
  insetBlock: 'space'
  insetBlockEnd: 'space'
  insetBlockStart: 'space'
  insetInline: 'space'
  insetInlineEnd: 'space'
  insetInlineStart: 'space'
  margin: 'space'
  marginTop: 'space'
  marginRight: 'space'
  marginBottom: 'space'
  marginLeft: 'space'
  marginBlock: 'space'
  marginBlockEnd: 'space'
  marginBlockStart: 'space'
  marginInline: 'space'
  marginInlineEnd: 'space'
  marginInlineStart: 'space'
  padding: 'space'
  paddingTop: 'space'
  paddingRight: 'space'
  paddingBottom: 'space'
  paddingLeft: 'space'
  paddingBlock: 'space'
  paddingBlockEnd: 'space'
  paddingBlockStart: 'space'
  paddingInline: 'space'
  paddingInlineEnd: 'space'
  paddingInlineStart: 'space'
  scrollMargin: 'space'
  scrollMarginTop: 'space'
  scrollMarginRight: 'space'
  scrollMarginBottom: 'space'
  scrollMarginLeft: 'space'
  scrollMarginBlock: 'space'
  scrollMarginBlockEnd: 'space'
  scrollMarginBlockStart: 'space'
  scrollMarginInline: 'space'
  scrollMarginInlineEnd: 'space'
  scrollMarginInlineStart: 'space'
  scrollPadding: 'space'
  scrollPaddingTop: 'space'
  scrollPaddingRight: 'space'
  scrollPaddingBottom: 'space'
  scrollPaddingLeft: 'space'
  scrollPaddingBlock: 'space'
  scrollPaddingBlockEnd: 'space'
  scrollPaddingBlockStart: 'space'
  scrollPaddingInline: 'space'
  scrollPaddingInlineEnd: 'space'
  scrollPaddingInlineStart: 'space'
  top: 'space'
  right: 'space'
  bottom: 'space'
  left: 'space'
  fontSize: 'fontSizes'
  background: 'colors'
  backgroundColor: 'colors'
  backgroundImage: 'colors'
  borderImage: 'colors'
  border: 'borders'
  borderBlock: 'borders'
  borderBlockEnd: 'borders'
  borderBlockStart: 'borders'
  borderBottom: 'borders'
  borderBottomColor: 'borders'
  borderColor: 'colors'
  borderInline: 'colors'
  borderInlineEnd: 'colors'
  borderInlineStart: 'colors'
  borderLeft: 'colors'
  borderLeftColor: 'colors'
  borderRight: 'colors'
  borderRightColor: 'colors'
  borderTop: 'colors'
  borderTopColor: 'colors'
  caretColor: 'colors'
  color: 'colors'
  columnRuleColor: 'colors'
  outline: 'colors'
  outlineColor: 'colors'
  fill: 'colors'
  stroke: 'colors'
  textDecorationColor: 'colors'
  fontFamily: 'fonts'
  fontWeight: 'fontWeights'
  lineHeight: 'leads'
  letterSpacing: 'letterSpacings'
  blockSize: 'size'
  minBlockSize: 'size'
  maxBlockSize: 'size'
  inlineSize: 'size'
  minInlineSize: 'size'
  maxInlineSize: 'size'
  width: 'size'
  minWidth: 'size'
  maxWidth: 'size'
  height: 'size'
  minHeight: 'size'
  maxHeight: 'size'
  flexBasis: 'size'
  gridTemplateColumns: 'size'
  gridTemplateRows: 'size'
  borderWidth: 'borderWidths'
  borderTopWidth: 'borderWidths'
  borderLeftWidth: 'borderWidths'
  borderRightWidth: 'borderWidths'
  borderBottomWidth: 'borderWidths'
  borderRadius: 'radii'
  borderTopLeftRadius: 'radii'
  borderTopRightRadius: 'radii'
  borderBottomRightRadius: 'radii'
  borderBottomLeftRadius: 'radii'
  borderStyle: 'borderStyles'
  boxShadow: 'shadows'
  textShadow: 'shadows'
  transition: 'transitions'
  zIndex: 'zIndices'
  opacity: 'opacity'
}

export interface PinceauTheme extends GeneratedPinceauTheme, Omit<ConfigTokens, keyof GeneratedPinceauTheme>, PinceauTokens {}

export type PinceauThemePaths = GeneratedTokensPaths

export interface TokensFunctionOptions {
  /**
   * The key that will be unwrapped from the design token object.
   * @default variable
   */
  key?: string
  /**
   * Toggle logging if requesting an unknown token.
   * @default false
   */
  silent?: boolean
  /**
   * Makes the function compatible with flattened version of tokens file.
   */
  flattened?: boolean
}

export type DtFunction = (
  path: PinceauThemePaths
) => string

export type TokensFunction = (
  path?: PinceauThemePaths,
  options?: TokensFunctionOptions,
  theme?: PinceauTheme,
  aliases?: { [key: string]: string }
) => PinceauTokens | DesignToken | number | string
