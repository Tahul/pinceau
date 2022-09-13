import fs from 'fs'
import chalk from 'chalk'
import { parse } from '@vue/compiler-sfc'
import type { PinceauContext, TokensFunction } from '../../types'
import { logger } from '../../utils'
import type { VueQuery } from '../../utils/vue'
import { transformDt } from '../dt'
import { transformCssFunction } from '../css'

const screenRegex = /(@screen\s(.*?)\s{)/g
const darkRegex = /(@dark\s{)/g
const lightRegex = /(@light\s{)/g

export const transformVueStyle = (id: string, query: VueQuery, ctx: PinceauContext) => {
  const { filename } = query

  const file = fs.readFileSync(filename, 'utf8')

  const { descriptor } = parse(file, { filename })

  const style = descriptor.styles[query.index!]

  let source = style?.content || ''

  source = transformStyle(source, ctx.$tokens)
  source = transformCssFunction(source, id, {}, ctx.$tokens)

  if (style?.content !== source) {
    return source
  }
}

/**
 * Helper grouping all resolvers applying to <style>
 */
export function transformStyle(code = '', $tokens: TokensFunction) {
  code = transformDt(code)
  code = transformScreens(code, $tokens)
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
 * Resolve `@screen {screenSize}` declarations.
 */
export function transformScreens(code = '', $tokens: TokensFunction): string {
  const screens = $tokens('screens', {
    flatten: false,
    key: undefined,
    silent: true,
  }) as any

  code = code.replace(
    screenRegex,
    (_, _screenDeclaration, screenSize) => {
      const screenToken = screens[screenSize]

      if (screenToken) {
        return `@media (min-width: ${screenToken.value}) {`
      }

      logger.warn(`This screen size is not defined: ${chalk.red(screenSize)}\n`)

      return '@media (min-width: 0px) {'
    },
  )

  return code
}
