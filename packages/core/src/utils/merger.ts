import { createDefu } from 'defu'

/**
 * Options merging function built with defu.
 */
export const merger = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) && Array.isArray(value)) {
    (obj as any)[key] = value
    return true
  }
})
