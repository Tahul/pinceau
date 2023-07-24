import MagicString from 'magic-string'
import { MagicVueSFC } from 'sfc-composer'
import type { PinceauContext, PinceauQuery, PinceauSFCTransformContext } from '@pinceau/shared'

export function usePinceauTransformContext(
  source: string,
  query: PinceauQuery,
  _pinceauContext: PinceauContext,
): PinceauSFCTransformContext {
  const ms = new MagicString(source, { filename: query.filename })

  const transformContext: PinceauSFCTransformContext = {
    query,
    get magicString() { return ms },
    get ms() { return ms },

    /**
     * Original code informations.
     */
    loc: { start: { column: 0, line: 0, offset: 0 }, end: { column: 0, line: 0, offset: 0 }, source },

    /**
     * Pinceau transform state.
     */
    computedStyles: {},
    localTokens: {},
    variants: {},

    /**
     * Get the current code at this state of the transform.
     */
    get code() { return ms.toString() },

    /**
     * Returns the SFCParseResult of a transform target if it is a Vue file.
     */
    get sfc() {
      const sfcCompilerResult = new MagicVueSFC(ms)
      return sfcCompilerResult
    },

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
