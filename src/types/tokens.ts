import type { MediaQueriesKeys } from './css'

export type RawTokenType = string | number | string[] | ''

export type ResponsiveToken<T = RawTokenType> = {
  [key in MediaQueriesKeys]?: T
}

export interface DesignToken<
  T = RawTokenType,
> {
  /**
   * The raw value of the token.
   */
  value?: T | ResponsiveToken<T>
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
  [key: string]: PinceauTokens | DesignToken | RawTokenType | ResponsiveToken
}
