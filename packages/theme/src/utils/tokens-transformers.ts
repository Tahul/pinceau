import { message } from '@pinceau/core/utils'
import type { Named, Transform } from 'style-dictionary-esm'

// Replace dashed by dotted
export const pinceauNameTransformer: Named<Transform> = {
  name: 'pinceau/name',
  type: 'name',
  matcher: () => true,
  transformer(token) {
    if (token?.path?.join('').includes('-')) { message('WRONG_TOKEN_NAMING', [token]) }
    return token?.path?.join('-')
  },
}

// Add `variable` key to attributes
export const pinceauVariableTransformer: Named<Transform> = {
  name: 'pinceau/variable',
  type: 'attribute',
  matcher: () => true,
  transformer(token) {
    return { variable: `var(--${token.name})` }
  },
}
