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
