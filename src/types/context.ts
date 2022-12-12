import type { ViteDevServer } from 'vite'
import type { PinceauTheme } from './theme'
import type { TokensFunction } from './dt'
import type { LoadConfigResult } from './config'
import type { PinceauOptions } from './'

export type ConfigOrPaths = PinceauTheme | string | string[] | undefined

export interface PinceauContext<UserOptions extends PinceauOptions = PinceauOptions> extends PinceauConfigContext<UserOptions>, PinceauVirtualContext {
  env: 'prod' | 'dev'
  tokens: any
  customProperties: any
  $tokens: TokensFunction
  options: PinceauOptions
  transformed: string[]
  addTransformed: (id: string) => void

  // Vite
  viteServer: ViteDevServer
  setViteServer(server: ViteDevServer): void
}

export interface PinceauConfigContext<UserOptions = PinceauOptions> {
  cwd: string
  updateCwd: (newCwd: string) => Promise<LoadConfigResult<PinceauTheme>>
  sources: string[]
  resolvedConfig: any
  ready: Promise<LoadConfigResult<PinceauTheme>>
  reloadConfig: (newOptions?: UserOptions) => Promise<LoadConfigResult<PinceauTheme>>
  registerConfigWatchers: () => void
  getConfig: () => Promise<PinceauTheme>
}

export interface ThemeGenerationOutput {
  buildPath: string
  tokens: any
  outputs: Record<string, any>
}

export interface PinceauVirtualContext {
  outputs: Record<string, any>
  updateOutputs: (generatedTheme: ThemeGenerationOutput) => void
  getOutput: (key: string) => string | undefined
  getOutputId: (key: string) => string | undefined
}

export interface PinceauTransformContext {
  variants: Record<string, any>
  computedStyles: Record<string, any>
}
