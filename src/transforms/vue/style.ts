import chalk from 'chalk'
import type { TokensFunction } from '../../types'
import { logger } from '../../utils'
import { resolveDt } from '../dt'

const screenRegex = /(@screen\s(.*?)\s{)/g
const darkRegex = /(@dark\s{)/g
const lightRegex = /(@light\s{)/g

/**
 * Helper grouping all resolvers applying to <style>
 */
export const resolveStyle = (code = '', $tokens: TokensFunction) => {
  code = resolveDt(code)
  code = resolveScreens(code, $tokens)
  code = resolveScheme(code, 'dark')
  code = resolveScheme(code, 'light')
  return code
}

export function resolveScheme(code = '', scheme: 'light' | 'dark') {
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
export function resolveScreens(code = '', $tokens: TokensFunction): string {
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

      logger.warn(
        `This screen size is not defined: ${chalk.red(screenSize)}\n\n`,
        'Available screen sizes: ', Object.keys(screens).map(screen => chalk.green(screen)).join(', '),
      )

      return '@media (min-width: 0px) {'
    },
  )

  return code
}
