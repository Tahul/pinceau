import MagicString from 'magic-string'
import type { SFCParseResult } from 'vue/compiler-sfc'
import { parse as sfcParse } from 'vue/compiler-sfc'
import { useDebugPerformance } from '../utils'
import type { PinceauContext, PinceauQuery } from '../types'
import type { PinceauTransformContext } from '../types/transforms'

export function useTransformContext(
  source: string,
  query: PinceauQuery,
  pinceauContext: PinceauContext,
): PinceauTransformContext {
  const { stopPerfTimer } = useDebugPerformance(`Transforming ${query.id}`, pinceauContext.options.debug)

  const ms = new MagicString(source, { filename: query.filename })

  let parsedSfc: SFCParseResult
  let lastParsedContent: string

  const transformContext: PinceauTransformContext = {
    query,
    get magicString() { return ms },

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
      // This file is not a `.vue` component, skip `sfc`
      if (!query.vue) { return undefined }

      const sfcCompilerResult = sfcParse(ms.toString(), { filename: query.filename })

      lastParsedContent = ms.toString()
      parsedSfc = sfcCompilerResult as SFCParseResult

      return sfcCompilerResult
    },

    /**
     * Stops transform and return result.
     */
    result() {
      stopPerfTimer()
      if (ms.hasChanged) {
        const code = ms.toString()
        if (query.vue) {
          console.log({ code })
        }
        const sourceMap = ms.generateMap()
        sourceMap.file = query.filename
        sourceMap.sources = [query.filename]
        return { code, map: sourceMap }
      }
    },
  }

  return transformContext
}
