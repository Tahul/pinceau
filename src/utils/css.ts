import color from 'tinycolor2'
import { kebabCase } from 'scule'
import type { DesignToken, TokensFunction } from '../types'
import { referencesRegex, rgbaRegex } from './transforms'

/**
 * Resolve a `var(--token)` value from a token path.
 */
export const resolveVariableFromPath = (path: string): string => `var(--${path.split('.').map((key: string) => kebabCase(key)).join('-')})`

/**
 * Resolve references
 */
export const resolveReferences = (key: string, value: string, $tokens: TokensFunction) => {
  value = value.replace(
    referencesRegex,
    (...parts) => {
      const [, tokenPath] = parts

      const token = $tokens(tokenPath, { key: undefined }) as DesignToken

      const tokenValue = token?.attributes?.variable || token?.value || token?.original?.value

      if (!tokenValue) { return '' }

      return tokenValue
    },
  )

  return value
}

/**
 * Resolve rgba() value properly
 */
export const resolveRgbaTokens = (key: string, value: string, $tokens: TokensFunction) => {
  value = value.replace(
    rgbaRegex,
    (...parts) => {
      let newValue = parts[0]

      newValue = newValue.replace(
        referencesRegex,
        (...reference) => {
          const [, referencePath] = reference

          const token = $tokens(referencePath, { key: undefined }) as DesignToken

          let tokenValue = token?.value || token?.original?.value

          if (!tokenValue) { return '0,0,0' }

          tokenValue = color(tokenValue).toRgb()

          return `${tokenValue.r},${tokenValue.g},${tokenValue.b}`
        },
      )

      return newValue
    },
  )

  return value
}
