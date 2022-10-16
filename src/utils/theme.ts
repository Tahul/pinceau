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
        value.original = value?.original?.value || undefined
        delete value.path
        delete value.name
        output[newKey] = value
        return
      }

      if (!isarray && isobject && Object.keys(value).length) { return step(value, newKey) }
    })
  }
  step(data)
  return output
}
