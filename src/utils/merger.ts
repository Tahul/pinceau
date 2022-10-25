import { createDefu } from 'defu'

/**
 * Options merging function built with defu.
 */
export const merger = createDefu((obj, key, value) => {
  if (obj[key] && Array.isArray(obj[key])) {
    Object.entries(value).forEach(([, val]) => {
      if (!obj[key].includes(val)) { obj[key].push(val) }
    })
    return true
  }
})
