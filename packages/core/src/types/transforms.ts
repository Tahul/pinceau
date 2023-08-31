import type { SourceMapCompact } from 'unplugin'
import type { SourceMapInput } from 'rollup'
import type { MagicSFC, SourceLocation } from 'sfc-composer'
import type { PinceauQuery } from './query'
import type { PinceauTransformContext } from './transform-context'
import type { PinceauContext } from './core-context'

export type PinceauTransformResult = { code: string; map?: SourceMapInput | SourceMapCompact | null } | undefined

export interface PropMatch {
  loc: SourceLocation
  type: 'raw' | 'bind'
  content: string
  [key: string]: any
}

export interface PinceauTransformer {
  MagicSFC: typeof MagicSFC
  parser: (...args: any[]) => any
  loadBlock: (file: string, query: PinceauQuery, ctx: PinceauContext) => string | undefined
  loadTransformers?: ((code: string, query: PinceauQuery, ctx: Partial<PinceauContext>) => string)[]
  extractProp?: (transformContext: PinceauTransformContext, prop: string) => PropMatch[]
  parserOptions?: any
}

export type PinceauTransformFunction<T = object> = (
  /** Current Pinceau's transform target context? */
  transformContext: PinceauTransformContext,
  /** Current Pinceau's context. */
  pinceauContext: PinceauContext,
  /** Extraneous args from transforms. */
  ...args: any[]
) => void | T

export interface PinceauTransforms {
  globals?: PinceauTransformFunction[]
  templates?: PinceauTransformFunction[]
  scripts?: PinceauTransformFunction[]
  styles?: PinceauTransformFunction[]
  customs?: PinceauTransformFunction[]
}
