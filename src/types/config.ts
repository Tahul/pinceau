import type { Schema } from 'untyped'
import type { CSSProperties } from './css'
import type { DesignToken, RawTokenType, ResponsiveToken, TokenKey } from './tokens'
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
export interface ResolvedConfigLayer<T> {
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
export type PinceauUtilsProperties = {
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
 * Properly unwraps a token value ensuring proper go-to definition on object keys and auto-completion on object values.
 */
export type UnwrapTokenValue<T extends TokenKey> =
  T extends DesignToken ?
      (T['value'] | T['raw']) extends ResponsiveToken ?
        Partial<(T['value'] | T['raw'] | T)> :
        T['value'] | T['raw'] | T
    : T

/**
 * Extensible configuration type
 */
export type PermissiveConfigType<T extends {} = {}> = T | { [K in keyof T]?: T[K] extends TokenKey ? T[K] | ResponsiveToken | UnwrapTokenValue<T[K]> : PermissiveConfigType<T[K]> }

/**
 * Reserved keys and extensible configuration type
 */
export type DefineConfigType = ReservedTokensConfig & PermissiveConfigType<PinceauTheme>
