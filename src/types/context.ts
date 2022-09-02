import type { LoadConfigResult } from 'unconfig'
import type { ViteDevServer } from 'vite'
import type { PinceauConfig } from './theme'
import type { PinceauOptions } from './'

export type ConfigOrPaths = PinceauConfig | string | string[] | undefined

export interface PinceauContext<UserOptions extends PinceauOptions = PinceauOptions> extends PinceauConfigContext<UserOptions>, PinceauVirtualContext {
  env: 'prod' | 'dev'
  tokens: PinceauConfig

  // Vite
  viteServer: ViteDevServer
  setViteServer(server: ViteDevServer): void
}

export interface PinceauConfigContext<UserOptions = PinceauOptions> {
  cwd: string
  updateCwd: (newCwd: string) => Promise<LoadConfigResult<PinceauConfig>>
  sources: string[]
  resolvedConfig: PinceauConfig
  ready: Promise<LoadConfigResult<PinceauConfig>>
  reloadConfig: (newOptions?: UserOptions) => Promise<LoadConfigResult<PinceauConfig>>
  registerConfigWatchers: (server: ViteDevServer) => void
  getConfig: () => Promise<PinceauConfig>
}

export interface ThemeGenerationOutput {
  buildPath: string
  tokens: PinceauConfig
  outputs: { [key: string]: any }
}

export interface PinceauVirtualContext {
  outputs: { [key: string]: any }
  updateOutputs: (generatedTheme: ThemeGenerationOutput) => void
  getOutput: (key: string) => string | undefined
  getOutputId: (key: string) => string | undefined
}
