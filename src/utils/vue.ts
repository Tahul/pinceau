import { readFileSync } from 'fs'
import { transformCssFunction, transformStyle } from '../transforms'
import type { PinceauContext, PinceauQuery } from '../types'
import { parseVueComponent } from './ast'

/**
 * Will load and transform a Vue <style> query.
 */
export const loadVueStyle = (query: PinceauQuery, ctx: PinceauContext) => {
  const { filename } = query

  const file = readFileSync(filename, 'utf8')

  if (!file) { return }

  const { descriptor } = parseVueComponent(file, { filename })

  if (!descriptor) { return }

  const style = descriptor?.styles?.[query.index!]

  if (!style?.content) { return }

  let source = style.content

  const loc = { query, ...style.loc }

  if (style.attrs.lang === 'ts') { source = transformCssFunction(query.id, source, undefined, undefined, undefined, ctx, loc) }

  return transformStyle(source, ctx, loc)
}
