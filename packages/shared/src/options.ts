import process from 'node:process'
import { join } from 'pathe'
import type { PinceauOptions, PinceauRuntimeOptions, PinceauStyleOptions, PinceauThemeOptions, PinceauUserOptions, PinceauVueOptions } from './types'
import { outputFileNames } from './regexes'
import { merger } from './merger'

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
  /* */
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
