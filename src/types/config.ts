import type { Schema } from 'untyped'
import type { CSSProperties } from './css'
import type { DesignToken, RawTokenType, TokenKey } from './tokens'
import type { ConfigSuggestion } from './preset'
import type { PinceauTheme } from './theme'

export interface LoadConfigResult<T> {
  config: T
  definitions: { [key: string]: any }
  sources: string[]
}

export interface ConfigLayer {
  cwd?: string
  configFileName?: string
  tokens?: any
}

export interface ResolvedConfigLayer<T> {
  path: string | undefined
  definitions: { [key: string]: any }
  config: T
}

export type PinceauUtilsProperties = Record<string, CSSProperties | ((value: any) => CSSProperties)>

export interface ConfigTokens {
  media?: Record<string, DesignToken | RawTokenType | Schema> & { $schema?: Schema }
  utils?: PinceauUtilsProperties
}

export type PermissiveConfigType<T extends {}> = {
  [K in keyof T]?: T[K] extends TokenKey
    ? TokenKey | (T[K] extends DesignToken ? T[K]['value'] : never)
    : TokenKey | PermissiveConfigType<T[K]> & { $schema?: Schema }
}

export type DefineConfigType = PermissiveConfigType<(ConfigTokens & (PinceauTheme extends undefined ? ConfigSuggestion : PinceauTheme))>
