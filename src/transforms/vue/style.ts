import fs from 'fs-extra'
import { parseVueComponent } from '../../utils/ast'
import type { PinceauContext, VueQuery } from '../../types'
import { logger } from '../../utils'
import { darkRegex, lightRegex, mqCssRegex } from '../../utils/regexes'
import { nativeQueries } from '../../utils/css'
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

  source = transformStyle(source, ctx)

  if (style?.content !== source) { return source }
}

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformStyle(code = '', ctx: PinceauContext) {
  code = transformDtHelper(code)
  code = transformMediaQueries(code, ctx)
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
export function transformMediaQueries(code = '', ctx: PinceauContext): string {
  const mediaQueries = ctx.$tokens('media', { key: undefined })

  code = code.replace(
    mqCssRegex,
    (declaration, query) => {
      if (nativeQueries.includes(query)) { return declaration }

      const mediaQuery = mediaQueries[query]

      if (mediaQuery) { return `@media ${mediaQuery.value} {` }

      logger.warn(`This media query is not defined: ${mediaQuery}\n`)

      return '@media (min-width: 0px) {'
    },
  )

  return code
}
