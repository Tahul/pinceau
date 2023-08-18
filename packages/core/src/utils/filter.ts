import micromatch from 'micromatch'
import type { PinceauOptions } from '../types/options'

/**
 * Is path included from options.
 */
export function isPathIncluded(id: string, options: PinceauOptions): boolean {
  const [filename] = id.split('?', 2)

  const includes = micromatch.contains(filename, options.style.includes)
  const excludes = micromatch.contains(filename, options.style.excludes)

  // Directly include if path is in the includes list
  if (includes) { return true }

  // Exclude if path is in the excludes list
  if (excludes) { return false }

  // Include by default if path is neither in includes nor excludes
  return true
}
