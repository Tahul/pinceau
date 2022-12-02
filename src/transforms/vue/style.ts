import fs from 'fs-extra'
import { parseVueComponent } from '../../utils/ast'
import type { PinceauContext, VueQuery } from '../../types'
import { darkRegex, lightRegex, mqCssRegex } from '../../utils/regexes'
import { transformDtHelper } from '../dt'
import { transformCssFunction } from '../css'

export const transformVueStyle = (query: VueQuery, ctx: PinceauContext) => {
  const { filename } = query

  const file = fs.readFileSync(filename, 'utf8')

  const { descriptor } = parseVueComponent(file, { filename })

  const style = descriptor?.styles?.[query.index!]

  if (!style) { return }

  let source = style?.content || ''

  const loc = { query, ...style.loc }

  if (style.attrs.lang === 'ts') { source = transformCssFunction(query.id, source, undefined, undefined, ctx, loc) }

  source = transformStyle(source, ctx, loc)

  if (style?.content !== source) { return source }
}

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformStyle(code = '', ctx: PinceauContext, loc?: any) {
  code = transformDtHelper(code)
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
 * Resolve `@{mediaQuery}` declarations.
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
