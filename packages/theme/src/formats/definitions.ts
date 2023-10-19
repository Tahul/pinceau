import type { PinceauThemeFormat } from '../types'

/**
 * definitions.ts
 */
export const definitionsFormat: PinceauThemeFormat = {
  destination: 'definitions.js',
  importPath: '@pinceau/outputs/definitions',
  virtualPath: '/__pinceau_definitions.js',
  formatter({ loadedTheme }) {
    const { definitions } = loadedTheme

    return `export const definitions = ${JSON.stringify(definitions || {}, null, 2)}\n\nexport default definitions`
  },
}
