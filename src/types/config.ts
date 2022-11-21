import type { CSS } from './css'
import type { DesignToken, RawTokenType } from './tokens'
import type { ConfigSuggestion } from './preset'
// @ts-ignore
import type { GeneratedPinceauTheme } from '#pinceau/types'

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

export type PinceauUtilsProperties = Record<keyof CSS, CSS | ((value: string | number) => CSS)> & Record<string, CSS | ((value: string | number) => CSS)>

export interface ConfigTokens {
  media?: Record<string, RawTokenType>
  utils?: PinceauUtilsProperties
}

export type ConfigToken = RawTokenType | DesignToken

export interface PermissiveConfigType { [key: string | number | symbol]: ConfigToken | PermissiveConfigType }

export type DefineConfigType = ConfigTokens & (GeneratedPinceauTheme extends undefined ? ConfigSuggestion : GeneratedPinceauTheme) & PermissiveConfigType
