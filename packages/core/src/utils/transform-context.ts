import MagicString from 'magic-string'
import type { MagicBlock } from 'sfc-composer'
import { createSourceLocation, proxyBlock } from 'sfc-composer'
import type { PinceauContext, PinceauQuery, PinceauTransformContext, PinceauTransformFunction, PinceauTransformState, PinceauTransforms } from '../types'

export function usePinceauTransformContext(
  source: string | MagicString,
  query: PinceauQuery,
  pinceauContext: PinceauContext,
): PinceauTransformContext {
  const ms = typeof source !== 'string' ? source : new MagicString(source, { filename: query.filename })

  // Executable transforms on this context.
  const transforms: PinceauTransforms = {
    customs: [],
    scripts: [],
    styles: [],
    templates: [],
    globals: [],
  }

  // Current block target (when running on parsed SFC)
  let currentTarget: MagicBlock | undefined

  // Current compiler result
  let sfcCompilerResult: any

  // Local state in case there is no global state available for this file
  let localState: PinceauTransformState = {}

  const transformContext: PinceauTransformContext = {

    /**
     * Original code informations.
     */
    loc: createSourceLocation(ms.toString()),

    /**
     * Query made by bundler parsed.
     */
    query,

    /**
     * Transform state resolved.
     */
    get state() {
      if (!pinceauContext.transformed[this.query.filename]) { return localState }
      if (!pinceauContext.transformed[this.query.filename]?.state) { pinceauContext.transformed[this.query.filename].state = {} }
      return pinceauContext.transformed[this.query.filename].state as PinceauTransformState
    },

    /**
     * Current complete MagicString.
     */
    get ms() { return ms },

    /**
     * Return current transform target out of query parameters.
     */
    get target() {
      if (currentTarget) { return currentTarget }

      return proxyBlock(
        this.ms,
        {
          lang: this.query.lang,
          type: this.query.type,
          loc: this.loc,
        },
      )
    },

    /**
     * Get the current code at this state of the transform.
     */
    get code() { return ms.toString() },

    /**
     * Registered transforms per target types.
     */
    transforms,

    /**
     * Register new transforms.
     */
    registerTransforms(newTransforms: Partial<PinceauTransforms>) {
      Object.entries(newTransforms).forEach(([key, transformArray]) => {
        transforms[key] = transforms?.[key] ? transforms[key].concat(transformArray) : transformArray
      })
    },

    /**
     * Returns the SFCParseResult of a transform target if it is a Vue file.
     */
    get sfc() {
      if (!query.sfc) { return }

      if (sfcCompilerResult) { return sfcCompilerResult }

      // Grab parser from SFC resolved type
      const parser = pinceauContext?.transformers?.[query.ext]
      if (!parser) { return }

      // Return a MagicSFC using the apropriate parser
      sfcCompilerResult = new parser.MagicSFC(ms, { parser: parser.parser, parserOptions: parser?.parserOptions })

      return sfcCompilerResult
    },

    transform() {
      const applyTransforms = (
        transforms: PinceauTransformFunction[],
      ) => {
        for (const transformFn of transforms) {
          transformFn?.(this, pinceauContext)
        }
      }

      // Apply globals transforms
      if (transforms?.globals?.length) { applyTransforms(transforms.globals) }

      // Apply SFC transforms
      if (query.sfc && this.sfc) {
        const blockTypes = ['styles', 'templates', 'scripts', 'customs']

        for (const blockType of blockTypes) {
          const blocks = this.sfc?.[blockType] || []

          for (const block of blocks) {
            currentTarget = block
            applyTransforms(transforms[blockType])
          }
        }

        currentTarget = undefined

        return
      }

      if (transforms?.styles?.length && query.type === 'style') { applyTransforms(transforms.styles) }
      if (transforms?.templates?.length && query.type === 'template') { applyTransforms(transforms.templates) }
      if (transforms?.scripts?.length && query.type === 'script') { applyTransforms(transforms.scripts) }
      if (transforms?.customs?.length && query.type === 'custom') { applyTransforms(transforms.customs) }
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
