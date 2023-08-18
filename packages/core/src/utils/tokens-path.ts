/**
 * Make a list of `get()` compatible paths for any object.
 */
export function tokensPaths(
  data: any,
  mqKeys: string[] = [],
) {
  const output: [string, string][] = []
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

      // Handle full token format
      if (
        typeof value === 'object'
        && (
          isRawTokenLike(value?.value)
          || isResponsiveTokenObjectLike(value?.value, mqKeys)
        )
      ) {
        output.push([newKey, value?.value])
        return
      }

      // Handle responsive objects
      if (isResponsiveTokenObjectLike(value, mqKeys)) {
        output.push([newKey, value])
        return
      }

      // Handle raw token format
      if (isRawTokenLike(value)) {
        output.push([newKey, value])
        return
      }

      if (!isarray && isobject && Object.keys(value).length) { return step(value, newKey) }
    })
  }
  step(data)
  return output
}

export function isResponsiveTokenObjectLike(value: any, mqKeys?: string[]) {
  if (typeof value === 'object') {
    return value?.initial && mqKeys ? Object.keys(value).some(key => key !== 'initial' && (mqKeys).includes(key)) : false
  }
}

export function isRawTokenLike(value: any) {
  return (
    typeof value !== 'undefined'
    && (
      typeof value === 'string'
      || typeof value === 'number'
      || Array.isArray(value)
    )
  )
}
