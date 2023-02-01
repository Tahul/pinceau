import type { PinceauContext } from '../../types'
import { darkRegex, lightRegex, mqCssRegex } from '../../utils/regexes'
import { transformDtHelper } from '../dt'

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformStyle(code = '', ctx: PinceauContext, loc?: any) {
  code = transformDtHelper(code, ctx)
  code = transformMediaQueries(code, ctx, loc)
  code = transformScheme(code, 'dark')
  code = transformScheme(code, 'light')
  return code
}

/**
 * Transform media scheme into proper declaration
 */
export function transformScheme(code = '', scheme: 'light' | 'dark') {
  // Only supports `light` and `dark` schemes as they are native from browsers.
  const schemesRegex = {
    light: lightRegex,
    dark: darkRegex,
  }

  code = code.replace(
    schemesRegex[scheme],
    () => `@media (prefers-color-scheme: ${scheme}) {`,
  )

  return code
}

/**
 * Resolve `@{media.xl}` declarations.
 */
export function transformMediaQueries(code = '', ctx: PinceauContext, loc?: any): string {
  const mediaQueries = ctx.$tokens('media', { key: undefined, loc })

  code = code.replace(
    mqCssRegex,
    (declaration, query) => {
      const mediaQuery = mediaQueries?.[query]

      if (!mediaQuery) { return declaration }

      return `@media ${mediaQuery.value} {`
    },
  )

  return code
}
