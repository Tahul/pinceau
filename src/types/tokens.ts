import type { Schema } from 'untyped'
import type { PinceauMediaQueries } from './theme'

export type RawTokenType = string | number

export type ResponsiveToken<T = RawTokenType> = { [key in PinceauMediaQueries]?: T }

export type TokenKey<T = RawTokenType> = DesignToken<T> | ResponsiveToken<T> | T

export interface DesignToken<T = RawTokenType> {
  /**
   * The schema definition for the schema output format.
   */
  $schema?: Schema
  /**
   * The raw value of the token.
   */
  value: T | ResponsiveToken<T>
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
  original?: string | Omit<DesignToken, 'original'>
  /**
   * The file path to the source of this token
   */
  source?: string
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
}

export interface PinceauTokens {
  [key: string]: TokenKey | PinceauTokens
}
