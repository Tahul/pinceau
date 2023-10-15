import MagicString from 'magic-string'
import type { MagicBlock, MagicSFC } from 'sfc-composer'
import { createSourceLocation, proxyBlock } from 'sfc-composer'
import type { PinceauContext, PinceauQuery, PinceauQueryBlockType, PinceauTransformContext, PinceauTransformFunction, PinceauTransformState, PinceauTransforms } from '../types'

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
  let currentTarget: MagicBlock<{ type: PinceauQueryBlockType }> | undefined

  // Current compiler result
  let sfc: MagicSFC

  // Local state in case there is no global state available for this file
  const localState: PinceauTransformState = {}

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
     * State from previous transform pass state resolved.
     *
     * State for a file only get reset when a new query to the main file, without parameters, is made.
     */
    get previousState() {
      return pinceauContext.transformed?.[this.query.filename]?.previousState as PinceauTransformState
    },

    /**
     * Current complete MagicString.
     */
    get ms() { return ms },

    /**
     * Return current transform target out of query parameters.
     */
    get target(): MagicBlock<{ type: PinceauQueryBlockType }> {
      if (currentTarget) { return currentTarget }

      return proxyBlock(
        this.ms,
        {
          index: this.query.index || 0,
          type: this.query.type || 'script',
        },
      )
    },

    /**
     * Update the currnet target
     */
    set target(target) {
      currentTarget = target
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

      if (sfc) { return sfc }

      return sfc
    },

    /**
     * Parse the source code with associated parser if present.
     */
    async parse() {
      // Grab parser from SFC resolved type
      const transformer = pinceauContext?.transformers?.[query.ext]

      if (!transformer) { return }

      // Return a MagicSFC using the apropriate parser
      sfc = new transformer.MagicSFC(ms, { parser: transformer.parser, parserOptions: transformer?.parserOptions, lazy: true })

      await sfc.parse()
    },

    async transform() {
      if (query.sfc) { await this.parse() }

      const applyTransforms = async (
        transforms: PinceauTransformFunction[],
      ) => {
        for (const transformFn of transforms) { await transformFn?.(this, pinceauContext) }
      }

      // Apply SFC transforms
      if (query.sfc && this.sfc) {
        const blockTypes = ['styles', 'templates', 'scripts', 'customs']

        for (const blockType of blockTypes) {
          const blocks = this.sfc?.[blockType] || []

          for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i]

            // Add `type` key to block; remove `s` coming from MagicSFC blocktypes
            block.type = blockType.slice(0, -1) as PinceauQueryBlockType

            // Add `index` to block for scope tracking
            block.index = i

            this.target = block

            await applyTransforms(transforms[blockType])
          }
        }

        currentTarget = undefined

        // Apply globals transforms
        if (transforms?.globals?.length) { await applyTransforms(transforms.globals) }

        return
      }

      if (transforms?.styles?.length && query.type === 'style') { await applyTransforms(transforms.styles) }
      if (transforms?.templates?.length && query.type === 'template') { await applyTransforms(transforms.templates) }
      if (transforms?.scripts?.length && query.type === 'script') { await applyTransforms(transforms.scripts) }
      if (transforms?.customs?.length && query.type === 'custom') { await applyTransforms(transforms.customs) }

      // Apply globals transforms
      if (transforms?.globals?.length) { await applyTransforms(transforms.globals) }
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
