import type { DesignTokens, ThemeTokenDefinition } from '../types'

/**
 * Walk through tokens definition an call callback on each design token.
 *
 * To work properly, tokens must first be normalized with normalizeTokens.
 */
export function walkTokens(
  obj: any,
  cb: (value: any, obj: any, paths: string[]) => any,
  paths: string[] = [],
) {
  let result: Record<string, any> = {}

  if (obj.value) {
    result = cb(obj, result, paths) || obj.value
  }
  else {
    for (const k in obj) {
      if (obj[k] && typeof obj[k] === 'object') { result[k] = walkTokens(obj[k], cb, [...paths, k]) }
    }
  }

  return result
}

/**
 * Normalize a tokens object definition.
 */
export function normalizeTokens(
  obj: any,
  mqKeys: string[],
  removeSchemaKeys = false,
) {
  let result: DesignTokens = {}

  if (obj.value) {
    result = obj
  }
  else {
    for (const k in obj) {
      // Handle `$schema`
      if (k === '$schema') {
        if (!removeSchemaKeys) { result[k] = obj[k] }
        continue
      }
      // Skip `utils`
      if (k === 'utils') {
        result[k] = obj[k]
        continue
      }
      // Cast string values into tokens
      if (
        obj[k]
        // Inline string/number/boolean/bigint/symbol values
        && (
          typeof obj[k] === 'string'
            || typeof obj[k] === 'number'
            || typeof obj[k] === 'boolean'
            || typeof obj[k] === 'symbol'
            || typeof obj[k] === 'bigint'
        )
      ) { result[k] = { value: obj[k] } }
      // Walk on nested object
      else if (obj[k] && typeof obj[k] === 'object') {
        // Handle responsive tokens
        const keys = Object.keys(obj[k])
        if (
          keys.includes('$initial')
          && keys.some(key => key !== '$initial' && mqKeys.includes(key))
        ) {
          result[k] = { value: obj[k] }
          continue
        }

        result[k] = normalizeTokens(obj[k], mqKeys, removeSchemaKeys)
      }
    }
  }

  return result
}

/**
 * Flatten tokens object for runtime usage.
 */
export function flattenTokens(data: any): ThemeTokenDefinition {
  return walkTokens(data, value => ({ value: value?.value, variable: value?.attributes?.variable }))
}
