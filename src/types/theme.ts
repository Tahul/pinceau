import type { Defu } from 'defu'
import type { NestedKeyOf, WrapUnion } from '.'
// eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
// @ts-ignore - Can be not found
import type { GeneratedPinceauTheme } from '#pinceau/types'

type PermissiveKey = string

export interface DesignToken<T = string | number> {
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
   * Token extraneous attributes.
   */
  attributes?: {
    category?: string
    type?: string
    item?: string
    subitem?: string
    state?: string
    [key: PermissiveKey]: any
  }
  /* Permissive type */
  [key: PermissiveKey]: any
}

export interface PinceauTokens {
  [key: string]: PinceauTokens | DesignToken | undefined
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
  heavyBlack: DesignToken
}

export interface GlobalTokens {
  colors?: ScaleTokens
  fonts?: PinceauTokens
  fontWeights?: FontWeightTokens
  fontSizes?: BreakpointsTokens
  sizings?: BreakpointsTokens
  spacings?: BreakpointsTokens
  screens?: BreakpointsTokens
  radius?: BreakpointsTokens
  borders?: BreakpointsTokens
  borderWidths?: BreakpointsTokens
  shadows?: BreakpointsTokens
  opacity?: BreakpointsTokens
  lineHeight?: BreakpointsTokens
  lineHeights?: BreakpointsTokens
  letterSpacings?: BreakpointsTokens
  transitions?: PinceauTokens
  z?: PinceauTokens
}

export interface DefaultThemeMap {
  gap: 'spacings'
  columnGap: 'spacings'
  rowGap: 'spacings'
  inset: 'spacings'
  insetBlock: 'spacings'
  insetBlockEnd: 'spacings'
  insetBlockStart: 'spacings'
  insetInline: 'spacings'
  insetInlineEnd: 'spacings'
  insetInlineStart: 'spacings'
  margin: 'spacings'
  marginTop: 'spacings'
  marginRight: 'spacings'
  marginBottom: 'spacings'
  marginLeft: 'spacings'
  marginBlock: 'spacings'
  marginBlockEnd: 'spacings'
  marginBlockStart: 'spacings'
  marginInline: 'spacings'
  marginInlineEnd: 'spacings'
  marginInlineStart: 'spacings'
  padding: 'spacings'
  paddingTop: 'spacings'
  paddingRight: 'spacings'
  paddingBottom: 'spacings'
  paddingLeft: 'spacings'
  paddingBlock: 'spacings'
  paddingBlockEnd: 'spacings'
  paddingBlockStart: 'spacings'
  paddingInline: 'spacings'
  paddingInlineEnd: 'spacings'
  paddingInlineStart: 'spacings'
  scrollMargin: 'spacings'
  scrollMarginTop: 'spacings'
  scrollMarginRight: 'spacings'
  scrollMarginBottom: 'spacings'
  scrollMarginLeft: 'spacings'
  scrollMarginBlock: 'spacings'
  scrollMarginBlockEnd: 'spacings'
  scrollMarginBlockStart: 'spacings'
  scrollMarginInline: 'spacings'
  scrollMarginInlineEnd: 'spacings'
  scrollMarginInlineStart: 'spacings'
  scrollPadding: 'spacings'
  scrollPaddingTop: 'spacings'
  scrollPaddingRight: 'spacings'
  scrollPaddingBottom: 'spacings'
  scrollPaddingLeft: 'spacings'
  scrollPaddingBlock: 'spacings'
  scrollPaddingBlockEnd: 'spacings'
  scrollPaddingBlockStart: 'spacings'
  scrollPaddingInline: 'spacings'
  scrollPaddingInlineEnd: 'spacings'
  scrollPaddingInlineStart: 'spacings'
  top: 'spacings'
  right: 'spacings'
  bottom: 'spacings'
  left: 'spacings'
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
  lineHeight: 'lineHeights'
  letterSpacing: 'letterSpacings'
  blockSize: 'sizings'
  minBlockSize: 'sizings'
  maxBlockSize: 'sizings'
  inlineSize: 'sizings'
  minInlineSize: 'sizings'
  maxInlineSize: 'sizings'
  width: 'sizings'
  minWidth: 'sizings'
  maxWidth: 'sizings'
  height: 'sizings'
  minHeight: 'sizings'
  maxHeight: 'sizings'
  flexBasis: 'sizings'
  gridTemplateColumns: 'sizings'
  gridTemplateRows: 'sizings'
  borderWidth: 'borderWidths'
  borderTopWidth: 'borderWidths'
  borderLeftWidth: 'borderWidths'
  borderRightWidth: 'borderWidths'
  borderBottomWidth: 'borderWidths'
  borderRadius: 'radius'
  borderTopLeftRadius: 'radius'
  borderTopRightRadius: 'radius'
  borderBottomRightRadius: 'radius'
  borderBottomLeftRadius: 'radius'
  boxShadow: 'shadows'
  textShadow: 'shadows'
  transition: 'transitions'
  zIndex: 'z'
}

export interface PinceauTheme extends PinceauTokens, Defu<GlobalTokens, [GeneratedPinceauTheme]> {}

export type ThemeKey<K extends keyof DefaultThemeMap> = WrapUnion<NestedKeyOf<PinceauTheme[DefaultThemeMap[K]]>, `{${DefaultThemeMap[K]}.`, '}'>

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
   * Toggle deep flattening of the design token object to the requested key.
   *
   * If you query an token path containing mutliple design tokens and want a flat \`key: value\` object, this option will help you do that.
   */
  flatten?: boolean
}

export type TokensFunction = (
  path?: string | undefined,
  options?: TokensFunctionOptions,
  themeTokens?: PinceauTheme,
  tokenAliases?: { [key: string]: string }
) => PinceauTokens | DesignToken | number | string
