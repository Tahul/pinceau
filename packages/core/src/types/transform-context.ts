import type MagicString from 'magic-string'
import type { SourceMapCompact } from 'unplugin'
import type { SourceMapInput } from 'rollup'
import type { MagicVueSFC } from 'sfc-composer'
import type { PinceauQuery } from '@pinceau/core'

/**
 * From @vue/compiler-core
 */
export interface SourceLocation {
  start: Position
  end: Position
  source: string
}
export interface Position {
  offset: number
  line: number
  column: number
}
export type TransformResult = string | { code: string; map?: SourceMapInput | SourceMapCompact | null } | null | undefined

/**
 * Transform context available on any type of files.
 */
export interface PinceauTransformContext {
  ms: MagicString
  code: string
  query: PinceauQuery
  result: () => TransformResult
  loc?: SourceLocation
}

/**
 * Used when the component available if the file is a SFC.
 */
export interface PinceauSFCTransformContext extends PinceauTransformContext {
  sfc: MagicVueSFC
  computedStyles: Record<string, any>
  localTokens: Record<string, any>
  variants: Record<string, any>
}
