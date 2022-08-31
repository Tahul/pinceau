import { kebabCase } from 'scule'

/**
 * Resolve a `var(--token)` value from a token path.
 */
export const resolveVariableFromPath = (path: string): string => `var(--${path.split('.').map((key: string) => kebabCase(key)).join('-')})`
