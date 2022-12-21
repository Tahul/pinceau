import type { DefineConfigType } from '../types'
import { normalizeConfig } from '../utils/data'

export function defineTheme(config: DefineConfigType) {
  const mqKeys = ['dark', 'light', ...Object.keys(config?.media || [])]

  config = normalizeConfig(config, mqKeys)

  return config
}
