import type { CSSProperties } from './css'
import type { DesignToken, RawTokenType, ResponsiveToken } from './tokens'
import type { ConfigSuggestion } from './preset'
import type { PinceauTheme } from './theme'

export interface LoadConfigResult<T> {
  config: T
  sources: string[]
}

export interface ConfigLayer {
  cwd?: string
  configFileName?: string
  tokens?: any
}

export interface ResolvedConfigLayer<T> {
  path: string | undefined
  config: T
}

export type PinceauUtilsProperties = Record<string, CSSProperties | ((value: any) => CSSProperties)>

export interface ConfigTokens {
  media?: Record<string, DesignToken | RawTokenType>
  utils?: PinceauUtilsProperties
}

export type PermissiveConfigType<T extends {}> = {
  [K in keyof T]?: T[K] extends (DesignToken | RawTokenType)
    ? (RawTokenType | ResponsiveToken<RawTokenType> | (T[K] extends DesignToken ? T[K]['value'] : never)) | Partial<T[K]>
    : PermissiveConfigType<T[K]>
}

export type DefineConfigType = ConfigTokens & PermissiveConfigType<(PinceauTheme extends undefined ? ConfigSuggestion : PinceauTheme)>
