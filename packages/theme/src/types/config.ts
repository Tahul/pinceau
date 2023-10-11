import type { Schema } from 'untyped'
import type { CSSProperties } from '@pinceau/style'
import type { PinceauOptions, VirtualOutputs } from '@pinceau/core'
import type { DesignToken, RawTokenType, ResponsiveToken } from './tokens'
import type { PinceauImportsDefinition, PinceauThemeDefinitions, PinceauUtilsDefinition } from './definitions'
import type { GeneratedPinceauTheme as PinceauTheme } from '$pinceau/theme'

/**
 * Supports all the different ways of expressing configuration layers from `configOrPaths` from Pinceau's options.
 */
export type ConfigOrPaths = (string | ConfigLayer)[]

/**
 * A configuration layer as expressed by the user.
 */
export interface ConfigLayer {
  // File configuration layer
  path?: string
  configFileName?: string

  // Inline configuration layer
  tokens?: Theme
  imports?: PinceauImportsDefinition
  utils?: PinceauUtilsProperties
  definitions?: PinceauThemeDefinitions
}

/**
 * A config file import content.
 *
 * Includes both the content of the file as string and its evalued content as import.
 */
export interface ConfigFileImport {
  config: any
  content: string
  path: string
  ext: string
}

/**
 * Data extracted from a configuration by Pinceau build context.
 */
export interface ResolvedConfig {
  theme: Theme<PinceauTheme>
  imports: PinceauImportsDefinition
  utils: PinceauUtilsDefinition
  definitions: PinceauThemeDefinitions
}

/**
 * A layer of configuration that has been resolved before being loaded.
 */
export interface ResolvedConfigLayer extends ResolvedConfig, Omit<ConfigFileImport, 'config'> {}

/**
 * A full configuration data once loaded by Pinceau.
 */
export interface ThemeLoadingOutput extends ResolvedConfig {
  sources: string[]
  schema: Schema
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
  buildDir: string | undefined
  theme: Theme<PinceauTheme>
  outputs: VirtualOutputs
}

type UnwrapResponsiveToken<Source extends DesignToken<ResponsiveToken>> = Source['raw']

type UnwrapToken<Source extends DesignToken<RawTokenType>> = Source['value']

/**
 * Extensible configuration type
 */
export type ThemeTokenDefinition<D = {}> =
  { [K in keyof D]?: D[K] extends DesignToken<ResponsiveToken> ? UnwrapResponsiveToken<D[K]> | D[K] : D[K] | DesignToken<RawTokenType> | ThemeTokenDefinition }
  |
  { [K in keyof D]?: D[K] extends DesignToken<RawTokenType> ? UnwrapToken<D[K]> | D[K] : D[K] | DesignToken<ResponsiveToken> | ThemeTokenDefinition }
  |
  { $schema?: Schema }

/**
 * Reserved keys and extensible configuration type
 */
export type Theme<D = {}> =
  ReservedConfigKeys
  &
  (
    { [K in keyof D]: ThemeTokenDefinition<D[K]> }
    |
    { [key: string | number]: ThemeTokenDefinition }
  )

/**
 * Utils properties mappings.
 */
export type PinceauUtilsProperties = Record<string, (value: any) => CSSProperties>

/**
 * Media queries properties.
 */
export type PinceauMediaProperties = { $schema?: Schema } & Record<string, DesignToken<RawTokenType> | RawTokenType | Schema>

/**
 *
 */
export interface PinceauConfigContextOptions {
  /**
   * Whether to build the theme on init.
   */
  init: boolean
}

/**
 * Pinceau configuration plugin context.
 */
export interface PinceauConfigContext {
  /**
   * A list of watched sources
   */
  sources: string[]

  /**
   * Currently resolved configuration from the configuration loader.
   */
  config: ThemeLoadingOutput

  /**
   * Is the loader currently loading configurations layers?
   */
  ready: Promise<ThemeGenerationOutput>

  /**
   * Reload the configuration (with new options if provided)
   */
  buildTheme: (newOptions?: PinceauOptions) => Promise<ThemeGenerationOutput>
}
