import type { UserConfig as ViteConfig } from 'vite'

export function registerAliases(config: ViteConfig) {
  if (!config?.resolve) { config.resolve = {} }
  if (!config.resolve?.alias) { config.resolve.alias = {} }
}
