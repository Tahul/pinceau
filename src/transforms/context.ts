import MagicString from 'magic-string'
import { parse as sfcParse } from 'vue/compiler-sfc'
import { useDebugPerformance } from '../utils'
import type { PinceauContext, PinceauQuery } from '../types'
import type { PinceauParsedSFC, PinceauTransformContext } from '../types/transforms'
import { transformStyleTs } from './vue'

export function getTransformContext(
  source: string,
  query: PinceauQuery,
  pinceauContext: PinceauContext,
): PinceauTransformContext {
  const { stopPerfTimer } = useDebugPerformance(`Transforming ${query.id}`, pinceauContext.options.debug)

  // Enforce <style lang="ts"> into <style lang="postcss">
  // This transform is applied beyond source maps as it is directed towards vue/compiler-sfc.
  source = transformStyleTs(source, query)

  const ms = new MagicString(source, { filename: query.filename })

  let parsedSfc: PinceauParsedSFC

  const transformContext: PinceauTransformContext = {
    query,
    magicString: ms,

    /**
     * Original code informations.
     */
    loc: { source },

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
    sfc: () => {
      // This file is not a `.vue` component, skip `sfc`
      if (!query.vue) { return undefined }

      // Component has already been parsed
      if (parsedSfc) { return parsedSfc }

      const sfcCompilerResult = sfcParse(source, { filename: query.filename })

      const superChargeBlock = (block: any) => {
        if (!block?.loc?.start?.offset || !block?.loc?.end?.offset) { return }
        const start = block.loc.start.offset
        const end = block.loc.end.offset
        block.append = (text: string) => ms.appendRight(end.offset, text)
        block.prepend = (text: string) => ms.prependLeft(start.offset, text)
      }

      // Supercharge vue/compiler-sfc result with MagicString helpers
      ;['styles', 'script', 'customBlocks', 'scriptSetup', 'template'].forEach(
        (key) => {
          const block = sfcCompilerResult.descriptor?.[key]
          if ((key === 'styles' || key === 'customBlocks') && block) { block.forEach(superChargeBlock) }
          if (block) { superChargeBlock(block) }
        },
      )

      parsedSfc = sfcCompilerResult as PinceauParsedSFC

      return parsedSfc
    },

    /**
     * Check if the current transform target is a TypeScript module.
     */
    get isTs() {
      if (query?.lang === 'ts' || query?.ext === 'ts' || this.sfc?.descriptor?.scriptSetup?.lang === 'ts') { return true }
      return false
    },

    /**
     * Stops transform and return result.
     */
    result() {
      stopPerfTimer()
      const sourceMap = ms.generateMap()
      sourceMap.file = query.filename
      sourceMap.sources = [query.filename]
      if (query.vue) {
        console.log({
          query,
          code: ms.toString(),
        })
      }
      return { code: ms.toString(), map: sourceMap }
    },
  }

  return transformContext
}
