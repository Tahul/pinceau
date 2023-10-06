import { MagicSFC as MagicSvelteSFC } from 'sfc-composer/svelte'
import { preprocess } from 'svelte/compiler'
import type { PinceauTransformer } from '@pinceau/core'
import { loadComponentBlock } from './load'
import { extractProp } from './props'


export const PinceauSvelteTransformer: PinceauTransformer = {
  MagicSFC: MagicSvelteSFC,
  parser: preprocess,
  extractProp,
  loadBlock: loadComponentBlock,
  classBinding: (id, styleFn) => {
    const hasRuntime = styleFn.computedStyles.length || Object.keys(styleFn.variants).length

    if (hasRuntime) {
      return `class={$${id}} pcsp`
    }

    return `class="${styleFn.className}" pcsp`
  },
  loadTransformers: [],
}
