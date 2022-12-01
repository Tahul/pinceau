import type { CSSProperties } from './css'
import type { DesignToken, RawTokenType } from './tokens'
import type { ConfigSuggestion } from './preset'
import type { PinceauTheme } from './theme'

export interface LoadConfigResult<T> {
  config: T
  sources: string[]
}

export type ConfigLayer = string | {
  cwd?: string
  configFileName?: string
}

export interface ResolvedConfigLayer<T> {
  path: string | undefined
  config: T
}

export type PinceauUtilsProperties = Record<string, CSSProperties | ((value: any) => CSSProperties)>

export interface ConfigTokens {
  media?: Record<string, ConfigToken>
  utils?: PinceauUtilsProperties
}

export type ConfigToken = RawTokenType | DesignToken

export interface PermissiveConfigType { [key: string | number | symbol]: ConfigToken | PermissiveConfigType }

export type DefineConfigType = ConfigTokens & (PinceauTheme extends undefined ? ConfigSuggestion : PinceauTheme) & PermissiveConfigType
