import { kebabCase } from 'scule'
import { keyRegex } from '../../utils/regexes'

/**
  * Take a CSS property and transform every tokens present in it to their value.
  */
export function transformTokensToVariable(property: string): string { return (property || '').replace(keyRegex, (_, tokenPath) => resolveVariableFromPath(tokenPath)) }

/**
 * Resolve a `var(--token)` value from a token path.
 */
export function resolveVariableFromPath(path: string): string { return `var(--${path.split('.').map((key: string) => kebabCase(key)).join('-')})` }
