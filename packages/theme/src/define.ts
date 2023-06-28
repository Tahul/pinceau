import type { DefineConfigType, PinceauTheme } from '@pinceau/shared'

export function defineTheme<T extends PinceauTheme>(config: DefineConfigType<T>) {
  return config
}
