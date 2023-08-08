import process from 'node:process'
import { join } from 'pathe'
import type { PinceauThemeOptions } from '@pinceau/theme'
import type { PinceauStyleOptions } from '@pinceau/style'
import type { PinceauRuntimeOptions } from '@pinceau/runtime'
import type { PinceauVueOptions } from '@pinceau/vue'
import { merger } from './merger'
import type { PinceauOptions, PinceauUserOptions } from '../types'

export const outputFileNames = [
  '/__pinceau_css.css',
  '/__pinceau_ts.ts',
  '/__pinceau_utils.ts',
  '/__pinceau_definitions.ts',
  '/__pinceau_schema.ts',
  '/__pinceau_hmr.ts',
]

export const defaultThemeOptions: PinceauThemeOptions = {
  configFileName: 'tokens.config',
  configLayers: [],
  configResolved: (_) => {},
  configBuilt: (_) => {},
  buildDir: join(process.cwd(), 'node_modules/.vite/pinceau/'),
  preflight: true,
  followSymbolicLinks: true,
  colorSchemeMode: 'media',
  componentMeta: false,
  definitions: true,
  studio: false,
  utilsImports: [],
}

export const defaultStyleOptions: PinceauStyleOptions = {
  includes: [],
  excludes: [
    'node_modules',
    ...outputFileNames,
  ],
}

export const defaultRuntimeOptions: PinceauRuntimeOptions = {
  computedStyles: true,
  cssProp: true,
  variants: true,
  ssr: true,
  appId: false,
}

export const defaultVueOptions: PinceauVueOptions = {
  /* */
}

export const defaultOptions: PinceauUserOptions = {
  cwd: process.cwd(),
  debug: false,
  dev: process.env.NODE_ENV !== 'production',
  theme: true,
  style: true,
  runtime: true,
  vue: true,
}

export function normalizeOptions(options?: PinceauUserOptions): PinceauOptions {
  options = merger(options || {}, defaultOptions)

  if (options.theme === true || typeof options.theme === 'object') {
    options.theme = merger(typeof options.theme === 'object' ? options.theme : {}, defaultThemeOptions)
  }
  if (options.style === true || typeof options.style === 'object') {
    options.style = merger(typeof options.style === 'object' ? options.style : {}, defaultStyleOptions)
  }
  if (options.runtime === true || typeof options.runtime === 'object') {
    options.runtime = merger(typeof options.runtime === 'object' ? options.runtime : {}, defaultRuntimeOptions)
  }
  if (options.vue === true || typeof options.vue === 'object') {
    options.vue = merger(typeof options.vue === 'object' ? options.vue : {}, defaultVueOptions)
  }

  return options as PinceauOptions
}
