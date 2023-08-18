import type { SFCBlock } from 'vue/compiler-sfc'
import { parse as sfcParse } from 'vue/compiler-sfc'
import type { PinceauQuery } from '@pinceau/core'

/**
 * Load a specific <style> block from a Vue SFC query.
 */
export function loadComponentBlock(file: string, query: PinceauQuery): string | undefined {
  const { descriptor } = sfcParse(file, { filename: query.filename })

  let block: SFCBlock | undefined

  if (query.type === 'style') {
    const style = descriptor?.styles?.[query.index!]
    if (style) { block = style }
  }

  if (query.type === 'template') {
    const template = descriptor?.template
    if (template) { block = template }
  }

  if (query.type === 'script' && !query.setup) {
    const script = descriptor?.script
    if (script) { block = script }
  }

  if (query.type === 'script' && query.setup) {
    const scriptSetup = descriptor?.scriptSetup
    if (scriptSetup) { block = scriptSetup }
  }

  return block?.content
}
