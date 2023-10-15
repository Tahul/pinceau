/* c8 ignore start */

/**
 * Set a nested key in an object from a paths array.
 */
export function set(object: any, paths: string | string[], value: any, splitter = '.') {
  if (typeof paths === 'string') { paths = paths.split(splitter) }
  const limit = paths.length - 1
  for (let i = 0; i < limit; ++i) {
    const key = paths[i]
    if (typeof object[key] !== 'object' || object[key] === null) { object[key] = {} }
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
    if (typeof object[key] !== 'object' || object[key] === null) { object[key] = {} }
    object = object[key] ?? (object[key] = {})
  }
  const key = paths[limit]
  return object[key]
}
