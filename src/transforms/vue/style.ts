import fs from 'fs'
import chalk from 'chalk'
import { parseVueComponent } from '../../utils/ast'
import type { PinceauContext, TokensFunction } from '../../types'
import { logger } from '../../utils'
import type { VueQuery } from '../../utils/query'
import { darkRegex, lightRegex, mqCssRegex } from '../../utils/regexes'
import { transformDtHelper } from '../dt'
import { transformCssFunction } from '../css'

export const transformVueStyle = (id: string, query: VueQuery, ctx: PinceauContext) => {
  const { filename } = query

  const file = fs.readFileSync(filename, 'utf8')

  const { descriptor } = parseVueComponent(file, { filename })

  const style = descriptor?.styles?.[query.index!]

  if (!style) { return }

  let source = style?.content || ''

  source = transformCssFunction(id, source, undefined, undefined, ctx.$tokens)
  source = transformStyle(source, ctx.$tokens)

  if (style?.content !== source) { return source }
}

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformStyle(code = '', $tokens: TokensFunction) {
  code = transformDtHelper(code)
  code = transformMediaQueries(code, $tokens)
  code = transformScheme(code, 'dark')
  code = transformScheme(code, 'light')
  return code
}

export function transformScheme(code = '', scheme: 'light' | 'dark') {
  // Only supports `light` and `dark` schemes as they are native from browsers.
  const schemesRegex = {
    light: lightRegex,
    dark: darkRegex,
  }

  code = code.replace(schemesRegex[scheme], `@media (prefers-color-scheme: ${scheme}) {`)

  return code
}

/**
 * Resolve `@mq.{mediaQuery}` declarations.
 */
export function transformMediaQueries(code = '', $tokens: TokensFunction): string {
  // @ts-expect-error - Might be undefined
  const mediaQueries = $tokens('media', {
    key: undefined,
    silent: true,
  }) as any

  code = code.replace(
    mqCssRegex,
    (_, _mediaQueryDeclaration, query) => {
      const mediaQuery = mediaQueries[query]

      if (mediaQuery) { return `@media ${mediaQuery.value} {` }

      logger.warn(`This media query is not defined: ${chalk.red(mediaQuery)}\n`)

      return '@media (min-width: 0px) {'
    },
  )

  return code
}
