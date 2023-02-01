import type { DefineConfigType } from '../types'

export function defineTheme<T>(config: DefineConfigType): T {
  return config as T
}
