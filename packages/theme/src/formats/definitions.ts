import type { PinceauThemeFormat } from '../types'

/**
 * definitions.ts
 */
export const definitionsFormat: PinceauThemeFormat = {
  destination: 'definitions.ts',
  importPath: '$pinceau/definitions',
  virtualPath: '/__pinceau_definitions.ts',
  formatter({ loadedTheme }) {
    const { definitions } = loadedTheme

    return `export const definitions = ${JSON.stringify(definitions || {}, null, 2)} as const`
  },
}
