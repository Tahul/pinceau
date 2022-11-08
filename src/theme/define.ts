import { isShadowToken } from '../utils'
import type { ConfigTokens, PinceauTheme, PinceauTokens } from '../types'

export function walkConfig(
  obj: any,
  cb: (value: any, obj: any) => any,
  mqKeys: string[],
) {
  let result: { [key: string]: any } = {}

  if (obj.value) {
    result = cb(obj, result)
  }
  else {
    for (const k in obj) {
      // Skip `utils`
      if (k === 'utils') {
        result[k] = obj[k]
        continue
      }
      // Cast string values into tokens
      if (obj[k] && typeof obj[k] === 'string') { result[k] = { value: obj[k] } }
      // Cast inline shadow tokens
      if (obj[k] && isShadowToken(obj[k])) { result[k] = { value: obj[k] } }
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

        result[k] = walkConfig(obj[k], cb, mqKeys)
      }
    }
  }

  return result
}

export function defineTheme(config: ConfigTokens & PinceauTokens): PinceauTheme {
  const mqKeys = ['dark', 'light', ...Object.keys(config?.media || [])]

  // Cast `string` values into design tokens like object.
  config = walkConfig(
    config,
    (value) => {
      return value
    },
    mqKeys,
  )

  return config as PinceauTheme
}
