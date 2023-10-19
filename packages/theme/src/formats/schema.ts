import type { PinceauThemeFormat } from '../types'

export const schemaFormat: PinceauThemeFormat = {
  destination: 'schema.js',
  importPath: '@pinceau/outputs/schema',
  virtualPath: '/__pinceau_schema.js',
  formatter({ loadedTheme }) {
    const { schema } = loadedTheme

    let result = `export const schema = ${JSON.stringify({ properties: schema?.properties?.tokensConfig || {}, default: (schema?.default as any)?.tokensConfig || {} }, null, 2)}\n\n`

    result += 'export default schema'

    return result
  },
}
