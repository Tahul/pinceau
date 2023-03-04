import type { SFCStyleBlock } from 'vue/compiler-sfc'
import type { PinceauContext, PinceauTransformContext } from '../../types'
import { darkRegex, lightRegex, mqCssRegex } from '../../utils/regexes'
import { transformDtHelper } from '../dt'

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformCSS(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
  styleBlock?: SFCStyleBlock,
) {
  let code = styleBlock?.content || transformContext.code
  code = transformDtHelper({ code }, pinceauContext)
  code = transformMediaQueries({ ...transformContext, code }, pinceauContext)
  code = transformColorScheme({ ...transformContext, code }, 'dark')
  code = transformColorScheme({ ...transformContext, code }, 'light')

  if (code && styleBlock) {
    transformContext.magicString.remove(styleBlock.loc.start.offset, styleBlock.loc.end.offset)
    transformContext.magicString.appendRight(styleBlock.loc.start.offset, code)
  }
  else {
    transformContext.magicString.remove(0, transformContext.loc.source.length)
    transformContext.magicString.appendRight(0, code)
  }
}

/**
 * Transform media scheme into proper declaration
 */
export function transformColorScheme(
  transformContext: PinceauTransformContext,
  scheme: 'light' | 'dark',
) {
  const { code } = transformContext

  // Only supports `light` and `dark` schemes as they are native from browsers.
  const schemesRegex = {
    light: lightRegex,
    dark: darkRegex,
  }

  return code.replace(
    schemesRegex[scheme],
    () => {
      const mq = `@media (prefers-color-scheme: ${scheme}) {`
      return mq
    },
  )
}

/**
 * Resolve `@{media.xl}` declarations.
 */
export function transformMediaQueries(
  transformContext: PinceauTransformContext,
  pinceauContext: PinceauContext,
): string {
  const { code } = transformContext

  const mediaQueries = pinceauContext.$tokens('media', { key: undefined, loc: transformContext.loc })

  return code.replace(
    mqCssRegex,
    (declaration, ...args) => {
      const mq = mediaQueries?.[args[0]]
      if (!mq) { return declaration }
      return `@media ${mq.value} {`
    },
  )
}
