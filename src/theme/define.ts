import type { DefineConfigType } from '../types'

export function defineTheme<T = DefineConfigType>(config: T): typeof config {
  return config
}
