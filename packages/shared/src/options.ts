import { join } from 'pathe'
import type { PinceauOptions } from './types'
import { outputFileNames } from './regexes'

export const defaultOptions: PinceauOptions = {
  configFileName: 'tokens.config',
  configLayers: [],
  configResolved: (_) => {},
  configBuilt: (_) => {},
  cwd: process.cwd(),
  buildDir: join(process.cwd(), 'node_modules/.vite/pinceau/'),
  preflight: true,
  includes: [],
  excludes: [
    'node_modules/nuxt/dist/',
    'node_modules/@nuxt/ui-templates/',
    'node_modules/@vue/',
    'node_modules/pinceau/',
    ...outputFileNames,
  ],
  followSymbolicLinks: true,
  colorSchemeMode: 'media',
  debug: false,
  componentMetaSupport: false,
  runtime: true,
  definitions: true,
  studio: false,
  dev: process.env.NODE_ENV !== 'production',
  utilsImports: [],
}
