import type { Schema } from 'untyped'
import type { PinceauMediaQueries } from '@pinceau/outputs'

export type RawTokenType = string | number

/**
 * A token that uses media queries as keys and value as value for this breakpoint.
 */
export type ResponsiveToken<T = RawTokenType> = { initial: T | RawTokenType } & { [key in PinceauMediaQueries]?: T | RawTokenType }

/**
 * A Design Token object for Pinceau.
 */
export interface DesignToken<T extends RawTokenType | ResponsiveToken = RawTokenType | ResponsiveToken> {
  /**
   * The raw value of the token.
   */
  value: T
  /**
   * CSS Variable reference that gets generated out of the token path.
   */
  variable?: string
  /**
   * The schema definition for the schema output format.
   */
  $schema?: Schema
  /**
   * The file path to the source of this token.
   */
  source?: string
  /**
   * The raw value of this token, before transforms.
   */
  raw?: T
  /**
   * The name of the token, used by dictionnary.
   */
  name?: string
  /**
   * Token extraneous attributes.
   */
  attributes?: {
    [key: string | number]: any
  }
}

/**
 * A token key value pair in the configurations.
 */
export type TokenKey = DesignToken | RawTokenType | ResponsiveToken

/**
 * Simple recursive tokens object
 */
export interface DesignTokens {
  [key: string]: DesignTokens | DesignToken
}
