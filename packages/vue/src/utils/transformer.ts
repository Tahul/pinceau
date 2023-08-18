import { MagicVueSFC } from 'sfc-composer'
import { parse } from 'vue/compiler-sfc'
import type { PinceauTransformer } from '@pinceau/core'
import { transformStyleTs } from '../transforms/style-lang-ts'
import { loadComponentBlock } from './load'

export const PinceauVueTransformer: PinceauTransformer = {
  MagicSFC: MagicVueSFC,
  parser: parse,
  loadBlock: loadComponentBlock,
  loadTransformers: [transformStyleTs],
}
