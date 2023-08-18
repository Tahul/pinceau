import type { PinceauThemeFormat } from '../types'

export const schemaFormat: PinceauThemeFormat = {
  destination: 'schema.ts',
  importPath: '$pinceau/schema',
  virtualPath: '/__pinceau_schema.ts',
  formatter({ loadedTheme }) {
    const { schema } = loadedTheme

    let result = `export const schema = ${JSON.stringify({ properties: schema?.properties?.tokensConfig || {}, default: (schema?.default as any)?.tokensConfig || {} }, null, 2)} as const\n\n`

    result += 'export const GeneratedPinceauThemeSchema = typeof schema\n\n'

    result += 'export default schema'

    return result
  },
}
