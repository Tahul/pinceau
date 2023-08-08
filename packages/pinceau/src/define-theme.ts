import type { DefineConfigType, PinceauTheme } from '@pinceau/theme'

export function defineTheme<T extends PinceauTheme>(config: DefineConfigType<T>) {
  return config
}
