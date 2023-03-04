import { readFileSync } from 'fs'
import type { SFCStyleBlock } from 'vue/compiler-sfc'
import { parse as sfcParse } from 'vue/compiler-sfc'
import type { PinceauQuery } from '../types'

/**
 * Load a specific <style> block from a Vue SFC query.
 */
export const loadStyleBlock = (query: PinceauQuery): SFCStyleBlock => {
  const { filename } = query

  const file = readFileSync(filename, 'utf8')

  if (!file) { return }

  const { descriptor } = sfcParse(file, { filename: query.filename })

  if (!descriptor) { return }

  const style = descriptor?.styles?.[query.index!]

  if (!style?.content) { return }

  return style
}
