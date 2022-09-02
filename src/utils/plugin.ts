import type { UserConfig as ViteConfig } from 'vite'
import type { PinceauOptions } from '../types'

export function registerAliases<UserOptions extends PinceauOptions = PinceauOptions>(config: ViteConfig, options: UserOptions) {
  if (!config?.resolve) { config.resolve = {} }
  if (!config.resolve?.alias) { config.resolve.alias = {} }
}
