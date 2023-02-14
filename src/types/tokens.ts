import type { Schema } from 'untyped'
import type { PinceauMediaQueries } from './theme'

export type RawTokenType = string | number

/**
 * A token that uses media queries as keys and value as value for this breakpoint.
 */
export type ResponsiveToken<T = RawTokenType> = { initial: T } & { [key in PinceauMediaQueries]?: T }

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
  value: T | ResponsiveToken<T> | RawTokenType
  /**
   * CSS Variable reference that gets generated out of the token path.
   */
  variable?: string
  /**
   * The file path to the source of this token.
   */
  source?: string
  /**
   * The raw value of this token, before transforms.
   */
  raw?: T | ResponsiveToken<T> | RawTokenType
  /**
   * Token extraneous attributes.
   */
  attributes?: {
    [key: string | number]: any
  }
}

/**
 * Simple recursive tokens object
 */
export interface DesignTokens {
  [key: string | number]: TokenKey | DesignTokens
}
