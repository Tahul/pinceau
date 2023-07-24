import type MagicString from 'magic-string'
import type { SourceMapCompact } from 'unplugin'
import type { SourceMapInput } from 'rollup'
import type { SourceLocation } from '@vue/compiler-core'
import type { MagicVueSFC } from 'sfc-composer'
import type { PinceauQuery } from './utils'

export interface PinceauTransformContext {
  // Transform context
  magicString: MagicString
  ms: MagicString
  code: string
  query: PinceauQuery
  result: () => { code: string; map: SourceMapInput | SourceMapCompact | null } | void
  loc?: SourceLocation
}

export interface PinceauSFCTransformContext extends PinceauTransformContext {
  sfc: MagicVueSFC
  computedStyles: Record<string, any>
  localTokens: Record<string, any>
  variants: Record<string, any>
}

export interface StringifyContext {
  property: string
  value: any
  style: any
  selectors: any
}
