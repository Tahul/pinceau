import { walkTokens } from '../utils/data'

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
export const flattenTokens = (data: any, toValue = false) => {
  return walkTokens(data, (value) => {
    return toValue
      ? value?.value
      : {
          value: value?.value,
          variable: value?.attributes?.variable,
        }
  })
}
