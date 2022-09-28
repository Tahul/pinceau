/**
 * Make a list of `get()` compatible paths for any object.
 */
export const objectPaths = (data: any) => {
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

      if (value === 'DesignToken' && !output.includes(newKey)) { output.push(newKey) }

      if (!isarray && isobject && Object.keys(value).length) { return step(value, newKey) }
    })
  }
  step(data)
  return output
}

/**
 * Turns a token object into a flattened design tokens list.
 *
 * This allows to reduce bundle size of tokens for runtime usage and preserve solely necessary keys.
 */
export const flattenTokens = (data: any) => {
  const output: any = {}
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

      if (value.value && !output[newKey]) {
        delete value.path
        delete value.name
        delete value.original
        output[newKey] = value
        return
      }

      if (!isarray && isobject && Object.keys(value).length) { return step(value, newKey) }
    })
  }
  step(data)
  return output
}

/**
 * Get a key from an object with a dotted syntax.
 *
 * @example get({ foot: { bar: 'baz' } }, 'foo.bar') // 'baz'
 */
export const get = (obj: any, path: string | string[], defValue = undefined) => {
  if (!path) { return undefined }

  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g)

  const result = (pathArray || []).reduce(
    (prevObj, key) => prevObj && prevObj[key],
    obj,
  )

  return result === undefined ? defValue : result
}

/**
 * Walk through tokens and resolve aliased references.
 */
export const walkTokens = (
  obj: any,
  cb: (value: any, obj: any) => any,
) => {
  let result: { [key: string]: any } = {}

  if (obj.value) {
    result = cb(obj, result)
  }
  else {
    for (const k in obj) {
      if (obj[k] && typeof obj[k] === 'object') { result[k] = walkTokens(obj[k], cb) }
    }
  }

  return result
}
