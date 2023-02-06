import type { Schema } from 'untyped'
import type { PinceauMediaQueries } from './theme'

export type RawTokenType = string | number

/**
 * A token that uses media queries as keys and value as value for this breakpoint.
 */
export type ResponsiveToken<T = RawTokenType> = { [key in PinceauMediaQueries]?: T }

/**
 * A token key value pair in the configurations.
 */
export type TokenKey<T = RawTokenType> = DesignToken<T> | ResponsiveToken<T> | T

/**
 * A Design Token object for Pinceau.
 */
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
    [key: string]: any
  }
}

export interface PinceauTokens {
  [key: string]: TokenKey | PinceauTokens
}
