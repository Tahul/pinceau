import type { ViteDevServer } from 'vite'
import type { PinceauTheme, TokensFunction } from './theme'
import type { LoadConfigResult } from './config'
import type { PinceauOptions } from './'

export type ConfigOrPaths = PinceauTheme | string | string[] | undefined

export interface PinceauContext<UserOptions extends PinceauOptions = PinceauOptions> extends PinceauConfigContext<UserOptions>, PinceauVirtualContext {
  env: 'prod' | 'dev'
  tokens: PinceauTheme
  $tokens: TokensFunction

  // Vite
  viteServer: ViteDevServer
  setViteServer(server: ViteDevServer): void
}

export interface PinceauConfigContext<UserOptions = PinceauOptions> {
  cwd: string
  updateCwd: (newCwd: string) => Promise<LoadConfigResult<PinceauTheme>>
  sources: string[]
  resolvedConfig: PinceauTheme
  ready: Promise<LoadConfigResult<PinceauTheme>>
  reloadConfig: (newOptions?: UserOptions) => Promise<LoadConfigResult<PinceauTheme>>
  registerConfigWatchers: (server: ViteDevServer) => void
  getConfig: () => Promise<PinceauTheme>
}

export interface ThemeGenerationOutput {
  buildPath: string
  tokens: PinceauTheme
  outputs: { [key: string]: any }
}

export interface PinceauVirtualContext {
  outputs: { [key: string]: any }
  updateOutputs: (generatedTheme: ThemeGenerationOutput) => void
  getOutput: (key: string) => string | undefined
  getOutputId: (key: string) => string | undefined
}

export interface PinceauTransformContext {
  variantProps: { [key: string]: any }
}
