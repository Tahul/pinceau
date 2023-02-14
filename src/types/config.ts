import type { Schema } from 'untyped'
import type { CSSProperties } from './css'
import type { DesignToken, RawTokenType, ResponsiveToken } from './tokens'
import type { PinceauTheme } from './theme'

/**
 * A configuration layer as expressed by the user.
 */
export interface ConfigLayer {
  cwd?: string
  configFileName?: string
  tokens?: any
}

/**
 * A layer of configuration that has been resolved before being loaded.
 */
export interface ResolvedConfigLayer<T = PinceauTheme> {
  path: string | undefined
  definitions: { [key: string]: any }
  config: T
}

/**
 * A configuration data once loaded by Pinceau.
 */
export interface LoadConfigResult<T = any> {
  config: T
  definitions: { [key: string]: any }
  sources: string[]
}

/**
 * Utils properties mappings.
 */
export interface PinceauUtilsProperties {
  [key: string]: CSSProperties | ((value: any) => CSSProperties)
}

/**
 * Reserved keys from the configuration file.
 */
export interface ReservedTokensConfig {
  media?: Record<string, DesignToken | RawTokenType | Schema> & { $schema?: Schema }
  utils?: PinceauUtilsProperties
}

/**
 * Extensible configuration type
 */
export type PermissiveConfigType<T extends {} = {}> =
  |
  { [K in keyof T]?: T[K] extends DesignToken ? T[K]['raw'] extends ResponsiveToken<RawTokenType> ? T[K]['raw'] & ResponsiveToken<RawTokenType> : (T[K]['raw'] | ResponsiveToken<RawTokenType>) : never }
  |
  { [K in keyof T]?: T[K] extends ResponsiveToken<RawTokenType> ? T[K] & ResponsiveToken<RawTokenType> : never }
  |
  { [K in keyof T]?: T[K] extends RawTokenType ? T[K] | ResponsiveToken<T[K] | RawTokenType> : never }
  |
  { [K in keyof T]?: PermissiveConfigType<T[K]> }

/**
 * Reserved keys and extensible configuration type
 */
export type DefineConfigType = ReservedTokensConfig & PermissiveConfigType<PinceauTheme>
