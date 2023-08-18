import type MagicString from 'magic-string'
import type { MagicBlock, MagicSFC, SourceLocation } from 'sfc-composer'
import type { Thenable, TransformResult } from 'unplugin'
import type { PinceauQuery } from './query'
import type { PinceauTransformResult, PinceauTransforms } from './transforms'
import type { PinceauContext } from './core-context'

export interface PinceauTransformState {
  [key: string]: any
}

/**
 * Transform context available on any type of files.
 */
export interface PinceauTransformContext {
  loc: SourceLocation
  query: PinceauQuery
  ms: MagicString
  target: MagicBlock
  code: string
  state: PinceauTransformState
  transforms: PinceauTransforms
  registerTransforms: (transform: Partial<PinceauTransforms>) => void
  transform: () => void
  result: () => PinceauTransformResult

  // Optional
  sfc?: MagicSFC
}

/**
 * Pinceau transform function, same as Unplugin transform but includes PinceauContext as an argument.
 */
export type PinceauUnpluginTransform = (code: string, id: string, suite: PinceauTransforms, ctx: PinceauContext) => Thenable<TransformResult>
