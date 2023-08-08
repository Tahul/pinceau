import { readFileSync } from 'node:fs'
import type { PinceauQuery } from '../types'

export function loadFile(query: PinceauQuery) {
  const { filename } = query

  const file = readFileSync(filename, 'utf8')

  if (!file) { return }

  return file
}
