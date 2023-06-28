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
export function normalizeTokens(
  obj: any,
  mqKeys: string[],
  removeSchemaKeys = false,
) {
  let result: Record<string, any> = {}

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
          keys.includes('initial')
          && keys.some(key => mqKeys.includes(key))
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
 * Make a list of `get()` compatible paths for any object.
 */
export function objectPaths(data: any) {
  const output: any = []
  function step(obj: any, prev?: string) {
    Object.keys(obj).forEach((key) => {
      const value = obj[key]
      const isarray = Array.isArray(value)
      const type = Object.prototype.toString.call(value)
      const isobject
        = type === '[object Object]'
        || type === '[object Array]'

      const newKey = prev
        ? `${prev}.${key}`
        : key

      if ((typeof value?.value !== 'undefined' || typeof value === 'string') && !output.includes(newKey)) {
        output.push([newKey, value?.value || value])
        return
      }

      if (!isarray && isobject && Object.keys(value).length) { return step(value, newKey) }
    })
  }
  step(data)
  return output
}

/**
 * Flatten tokens object for runtime usage.
 */
export function flattenTokens(data: any, toValue = false, raw = true) {
  return walkTokens(data, (value) => {
    // Get slim token value object
    const toRet = toValue
      ? value?.value
      : {
          value: value?.value,
          variable: value?.attributes?.variable,
        }

    // Support writing raw value
    if (!toValue && raw && value?.original?.value) { toRet.raw = value.original.value }

    return toRet
  })
}
