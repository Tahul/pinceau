import { kebabCase } from 'scule'
import { keyRegex } from './regexes'

/**
 * Resolve a `var(--token)` value from a token path.
 */
export const resolveVariableFromPath = (path: string): string => `var(--${path.split('.').map((key: string) => kebabCase(key)).join('-')})`

export const transformTokensToVariable = (token: string) => {
  return token.replace(
    keyRegex,
    (_, tokenPath) => resolveVariableFromPath(tokenPath),
  )
}
