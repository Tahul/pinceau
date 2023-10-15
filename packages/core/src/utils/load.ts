import fs from 'node:fs'
import type { PinceauQuery } from '../types'

export function loadFile(query: PinceauQuery) {
  const { filename } = query

  const file = fs.readFileSync(filename, 'utf8')

  if (!file) { return }

  return file
}
