import { message } from '@pinceau/core/utils'
import type { PinceauThemeFormat, PinceauUtilsDefinition } from '../types'
import { isSafeConstName } from '../utils'

function stringifyUtils(value: PinceauUtilsDefinition) {
  const entries = Object.entries(value)

  return entries.reduce(
    (acc, [key, value]) => {
      // Check if util has valid key
      if (!isSafeConstName(key)) {
        message('UTIL_NAME_CONFLICT', [key])
        return acc
      }

      // Stringify from utils values instead
      acc += `export const ${key} = ${String(value)}\n\n`

      return acc
    },
    '',
  )
}

export const utilsFormat: PinceauThemeFormat = {
  destination: 'utils.ts',
  importPath: '$pinceau/utils',
  virtualPath: '/__pinceau_utils.ts',
  formatter({ loadedTheme }) {
    const { imports, utils } = loadedTheme

    // Add utilsImports from config
    let result = imports.filter(Boolean).join('\n')

    // Stringify utils properties
    result += `${result === '' ? '' : '\n'}${stringifyUtils(utils)}`

    result += `export const utils = ${Object.keys(utils).length ? `{ ${Object.keys(utils).join(', ')} }` : '{}'} as const\n\n`

    // Type of utils
    result += 'export type GeneratedPinceauUtils = typeof utils\n\n'

    // Default export
    result += 'export default utils'

    return result
  },
}