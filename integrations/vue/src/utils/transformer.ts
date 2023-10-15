import { MagicSFC as MagicVueSFC } from 'sfc-composer/vue'
import { parse } from 'vue/compiler-sfc'
import type { PinceauTransformer } from '@pinceau/core'
import { transformStyleTs } from '../transforms/style-lang-ts'
import { loadComponentBlock } from './load'
import { extractProp } from './props'

export const PinceauVueTransformer: PinceauTransformer = {
  MagicSFC: MagicVueSFC,
  parser: parse,
  extractProp,
  classBinding: (id, styleFn) => {
    const hasRuntime = styleFn.computedStyles.length || Object.keys(styleFn.variants).length

    if (hasRuntime) { return `:class="$${id}" pcsp` }

    return `class="${styleFn.className}" pcsp`
  },
  loadBlock: loadComponentBlock,
  loadTransformers: [transformStyleTs],
}
