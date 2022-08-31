import type { LoadConfigResult } from 'unconfig'
import type { ViteDevServer } from 'vite'
import type { PinceauConfig } from './theme'
import type { PinceauOptions } from './'

export type ConfigOrPaths = PinceauConfig | string | string[] | undefined

export interface PinceauContext<UserOptions extends PinceauOptions = PinceauOptions> extends PinceauConfigContext<UserOptions> {
  env: 'prod' | 'dev'
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
