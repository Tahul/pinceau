import { readFileSync } from 'node:fs'
import { parse as sfcParse } from 'vue/compiler-sfc'
import type { PinceauQuery } from '@pinceau/core'

export function loadFile(query: PinceauQuery) {
  const { filename } = query

  const file = readFileSync(filename, 'utf8')

  if (!file) { return }

  return file
}

/**
 * Load a specific <style> block from a Vue SFC query.
 */
export function loadComponentBlock(file: string, query: PinceauQuery): string | undefined {
  const { descriptor } = sfcParse(file, { filename: query.filename })

  if (query.type === 'style') {
    const style = descriptor?.styles?.[query.index!]?.content
    if (style) { return style }
  }

  if (query.type === 'template') {
    const template = descriptor?.template?.content
    if (template) { return template }
  }

  if (query.type === 'script') {
    const script = descriptor?.script?.content
    if (script) { return script }
  }

  if (query.type === 'script') {
    const scriptSetup = descriptor?.scriptSetup?.content
    if (scriptSetup) { return scriptSetup }
  }

  return file
}
