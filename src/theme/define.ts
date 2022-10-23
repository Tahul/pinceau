import { isShadowToken } from '../utils'
import type { ConfigTokens, PinceauTheme, PinceauTokens } from '../types'

export function walkConfig(
  obj: any,
  cb: (value: any, obj: any) => any,
) {
  let result: { [key: string]: any } = {}

  if (obj.value) {
    result = cb(obj, result)
  }
  else {
    for (const k in obj) {
      // Cast string values into tokens
      if (obj[k] && typeof obj[k] === 'string') { result[k] = { value: obj[k] } }
      // Cast inline shadow tokens
      if (obj[k] && isShadowToken(obj[k])) { result[k] = { value: obj[k] } }
      // Walk on nested object
      else if (obj[k] && typeof obj[k] === 'object') { result[k] = walkConfig(obj[k], cb) }
    }
  }

  return result
}

export function defineTheme(config: ConfigTokens & PinceauTokens): PinceauTheme {
  // Cast `string` values into design tokens like object.
  config = walkConfig(
    config,
    (value) => {
      return value
    },
  )

  return config as PinceauTheme
}
