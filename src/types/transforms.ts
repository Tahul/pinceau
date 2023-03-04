import type { SFCBlock, SFCParseResult, SFCScriptBlock, SFCStyleBlock, SFCTemplateBlock } from 'vue/compiler-sfc'
import type MagicString from 'magic-string'
import type { TransformResult } from 'unplugin'
import type { PinceauQuery } from './utils'

export interface PinceauTransformContext {
  magicString: MagicString
  code: string
  computedStyles: Record<string, any>
  localTokens: Record<string, any>
  variants: Record<string, any>
  query: PinceauQuery
  result: () => TransformResult
  loc?: any
  sfc?: () => PinceauParsedSFC
  isTs?: boolean
}

export interface SFCMagicStringBlockHelpers {
  append: MagicString['append']
  prepend: MagicString['prepend']
  replace: MagicString['replace']
}

export type PinceauParsedSFC = SFCParseResult & {
  descriptor: {
    template: (SFCMagicStringBlockHelpers & SFCTemplateBlock) | null
    script: (SFCMagicStringBlockHelpers & SFCScriptBlock) | null
    scriptSetup: (SFCMagicStringBlockHelpers & SFCScriptBlock) | null
    styles: (SFCStyleBlock & SFCMagicStringBlockHelpers)[]
    customBlocks: (SFCBlock & SFCMagicStringBlockHelpers)[]
  }
}

export interface StringifyContext {
  property: string
  value: any
  style: any
  selectors: any
}
