import { parse as sfcParse } from 'vue/compiler-sfc'
import type { PinceauContext, PinceauQuery } from '@pinceau/core'

/**
 * Load a specific <style> block from a Vue SFC query.
 */
export function loadComponentBlock(
  file: string,
  query: PinceauQuery,
  pinceauContext: PinceauContext,
): string | undefined {
  const { descriptor } = sfcParse(file, { filename: query.filename })

  if (typeof query.styleFunction === 'string') { return pinceauContext?.transformed?.[query.filename]?.state?.styleFunctions?.[query.styleFunction]?.css }

  if (query.type === 'style') { return descriptor?.styles?.[query.index!]?.content }

  if (query.type === 'template') { return descriptor?.template?.content }

  if (query.type === 'script' && !query.setup) { return descriptor?.script?.content }

  if (query.type === 'script' && query.setup) { return descriptor?.scriptSetup?.content }
}
