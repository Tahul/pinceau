/**
 * Get a key from an object with a dotted syntax.
 *
 * @example get({ foot: { bar: 'baz' } }, 'foo.bar') // 'baz'
 */

/**
 * Set a nested key in an object from a paths array.
 */
export function set(object: any, paths: string | string[], value: any, splitter = '.') {
  if (typeof paths === 'string') { paths = paths.split(splitter) }
  const limit = paths.length - 1
  for (let i = 0; i < limit; ++i) {
    const key = paths[i]
    object = object[key] ?? (object[key] = {})
  }
  const key = paths[limit]
  object[key] = value
}

/**
 * Get a nested key in an object from a paths array.
 */
export function get(object: any, paths: string | string[], splitter = '.') {
  if (typeof paths === 'string') { paths = paths.split(splitter) }
  const limit = paths.length - 1
  for (let i = 0; i < limit; ++i) {
    const key = paths[i]
    object = object[key] ?? (object[key] = {})
  }
  const key = paths[limit]
  return object[key]
}

/**
 * Walk through tokens definition an call callback on each design token.
 */
export function walkTokens(
  obj: any,
  cb: (value: any, obj: any, paths: string[]) => any,
  paths: string[] = [],
) {
  let result: Record<string, any> = {}

  if (obj.value) {
    result = cb(obj, result, paths)
  }
  else {
    for (const k in obj) {
      if (obj[k] && typeof obj[k] === 'object') {
        result[k] = walkTokens(obj[k], cb, [...paths, k])
      }
    }
  }

  return result
}

/**
 * Normalize a tokens object definition.
 */
export function normalizeConfig(
  obj: any,
  mqKeys: string[],
) {
  let result: Record<string, any> = {}

  if (obj.value) {
    result = obj
  }
  else {
    for (const k in obj) {
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
          keys.includes('initial')
          && keys.some(key => mqKeys.includes(key))
        ) {
          result[k] = { value: obj[k] }
          continue
        }

        result[k] = normalizeConfig(obj[k], mqKeys)
      }
    }
  }

  return result
}
