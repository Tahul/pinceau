import { message } from '@pinceau/core/utils'
import type SD from 'style-dictionary'

// Replace dashed by dotted
export const pinceauNameTransformer: SD.Named<SD.Transform> = {
  name: 'pinceau/name',
  type: 'name',
  matcher: () => true,
  transformer(token) {
    if (token?.path?.join('').includes('-')) { message('WRONG_TOKEN_NAMING', [token]) }
    return token?.path?.join('-')
  },
}

// Add `variable` key to attributes
export const pinceauVariableTransformer: SD.Named<SD.Transform> = {
  name: 'pinceau/variable',
  type: 'attribute',
  matcher: () => true,
  transformer(token) {
    return { variable: `var(--${token.name})` }
  },
}
