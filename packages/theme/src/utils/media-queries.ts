import type { Theme } from '../types'

/**
 * Resolve @mediaQueries keys from a tokens configuration.
 */
export function resolveMediaQueriesKeys(config: Theme | Theme[]) {
  if (Array.isArray(config)) { return Array.from(new Set<string>([].concat(...config.map(resolveMediaQueriesKeys)))) }

  const nativeKeys = ['$dark', '$light', '$initial']

  if (config.media && Object.keys(config.media).length) { return Array.from(new Set(nativeKeys.concat(Object.keys(config.media).map(k => `$${k}`)))) }

  return nativeKeys
}
