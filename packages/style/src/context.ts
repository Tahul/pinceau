import MagicString from 'magic-string'
import type { PinceauContext, PinceauQuery, PinceauTransformContext } from '@pinceau/shared'

export function usePinceauTransformContext(
  source: string,
  query: PinceauQuery,
  _pinceauContext: PinceauContext,
): PinceauTransformContext {
  const ms = new MagicString(source, { filename: query.filename })

  const transformContext: PinceauTransformContext = {
    query,
    get magicString() { return ms },
    get ms() { return ms },

    /**
     * Original code informations.
     */
    loc: { start: { column: 0, line: 0, offset: 0 }, end: { column: 0, line: 0, offset: 0 }, source },

    /**
     * Get the current code at this state of the transform.
     */
    get code() { return ms.toString() },

    /**
     * Stops transform and return result.
     */
    result() {
      if (ms.hasChanged()) {
        const code = ms.toString()
        const sourceMap = ms.generateMap()
        sourceMap.file = query.filename
        sourceMap.sources = [query.filename]
        return { code, map: sourceMap }
      }
    },
  }

  return transformContext
}
