import type { DefineConfigType, PermissiveConfigType, PinceauTheme } from '../types'

export function defineTheme<T = DefineConfigType>(config: T) {
  return config as PermissiveConfigType<PinceauTheme>
}
