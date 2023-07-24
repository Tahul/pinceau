import type { PinceauContext } from '@pinceau/shared'
import { darkRegex, lightRegex, mqCssRegex } from '@pinceau/shared'
import type MagicString from 'magic-string'
import type { MagicBlock } from 'sfc-composer'
import type { SFCBlock } from 'vue/compiler-sfc'
import { transformTokenHelper } from './helper'

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformStyle(
  ms: MagicString,
  pinceauContext: PinceauContext,
) {
  transformTokenHelper(ms, pinceauContext)
  transformMediaQueries(ms, pinceauContext)
  transformColorScheme(ms, pinceauContext)
}

/**
 * Transform media scheme into proper declaration
 */
export function transformColorScheme(
  ms: MagicString,
  pinceauContext: PinceauContext,
) {
  // Only supports `light` and `dark` schemes as they are native from browsers.
  const schemesRegex = {
    light: lightRegex,
    dark: darkRegex,
  }

  // Loop through supported color schemes
  Object.entries(schemesRegex).forEach(
    ([key, value]) => {
      ms.toString().replace(
        value,
        () => {
          let mq
          if (pinceauContext.options.theme.colorSchemeMode === 'media') { mq = `@media (prefers-color-scheme: ${key}) {` }
          else { mq = `:root.${key} {` }
          return mq
        },
      )
    },
  )
}

/**
 * Resolve `@{media.xl}` declarations.
 */
export function transformMediaQueries(
  ms: MagicBlock<SFCBlock> | MagicString,
  pinceauContext: PinceauContext,
): string {
  const loc = (ms as MagicBlock<SFCBlock>)?.loc

  const mediaQueries = pinceauContext.$tokens('media', { key: undefined, loc })

  return ms.toString().replace(
    mqCssRegex,
    (declaration, ...args) => {
      const mq = mediaQueries?.[args[0]]
      if (!mq) { return declaration }
      return `@media ${mq.value} {`
    },
  )
}
