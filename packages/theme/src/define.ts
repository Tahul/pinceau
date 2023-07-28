import type { DefineConfigType, PinceauTheme } from './types'

export function defineTheme<T extends PinceauTheme>(config: DefineConfigType<T>) {
  return config
}
