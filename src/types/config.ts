import type { Schema } from 'untyped'
import type { CSSProperties } from './css'
import type { DesignToken, DesignTokens, RawTokenType, ResponsiveToken } from './tokens'
import type { PinceauTheme } from './theme'
import type { VirtualOutputs } from './context'

/**
 * Supports all the different ways of expressing configuration layers from `configOrPaths` from Pinceau's options.
 */
export type ConfigOrPaths = (string | ConfigLayer)[]

/**
 * A configuration layer as expressed by the user.
 */
export interface ConfigLayer {
  cwd?: string
  configFileName?: string
  tokens?: DefineConfigType<any>
}

/**
 * A config file import content.
 *
 * Includes both the content of the file as string and its evalued content as import.
 */
export interface ConfigFileImport {
  tokens: any
  content: string
  path: string
}

/**
 * A layer of configuration that has been resolved before being loaded.
 */
export interface ResolvedConfigLayer extends ConfigFileImport {
  tokens: DesignTokens
  utils: PinceauUtilsProperties
  definitions: { [key: string]: any }
}

/**
 * A full configuration data once loaded by Pinceau.
 */
export interface ResolvedConfig extends Omit<ResolvedConfigLayer, 'path' | 'content'> {
  schema: { [key: string]: any }
  sources: string[]
}

/**
 * Utils properties mappings.
 */
export type PinceauUtilsProperties = Record<string, ((value: any) => CSSProperties) | CSSProperties>

/**
 * Media queries properties.
 */
export interface PinceauMediaProperties {
  $schema?: Schema
  [key: string]: DesignToken<RawTokenType> | RawTokenType | Schema
}

/**
 * Reserved keys in define config type.
 */
export interface ReservedConfigKeys {
  media?: PinceauMediaProperties
  utils?: PinceauUtilsProperties
}

/**
 * Theme generation output.
 */
export interface ThemeGenerationOutput {
  buildDir: string
  tokens: DesignTokens
  outputs: VirtualOutputs
}

/**
 * Extensible configuration type
 */
export type Theme<T> =
  {
    $schema?: Schema
  }
  |
  { [K in keyof T]?: T[K] extends DesignToken<ResponsiveToken> ? (Partial<T[K]['raw']> | DesignToken<Partial<T[K]['raw']>> | DesignToken) : Theme<T[K]> }
  |
  { [K in keyof T]?: T[K] extends DesignToken ? (T[K]['raw'] | T[K]) : Theme<T[K]> }
  |
  { [K in keyof T]?: T[K] extends DesignToken ? (T[K] | T[K]['raw'] | ResponsiveToken | DesignToken<ResponsiveToken> | DesignToken<T[K]['raw']>) : Theme<T[K]> }
  |
  { [K in keyof T]?: DesignToken | DesignToken<ResponsiveToken> | ResponsiveToken | RawTokenType | Theme<T[K]> }

/**
 * Reserved keys and extensible configuration type
 */
export type DefineConfigType<T extends PinceauTheme> = Theme<T> & ReservedConfigKeys
