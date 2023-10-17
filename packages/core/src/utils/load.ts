import type { PinceauContext } from '@pinceau/core'
import type { PinceauQuery } from '../types'

export function loadFile(
  query: PinceauQuery,
  pinceauContext: PinceauContext,
) {
  const { filename } = query

  if (!pinceauContext.fs) { return '' }

  const file = pinceauContext.fs.readFileSync(filename, 'utf8')

  if (!file) { return '' }

  return file
}
