import process from 'node:process'
import type { PinceauThemeOptions } from '@pinceau/theme'
import type { PinceauStyleOptions } from '@pinceau/style'
import type { PinceauRuntimeOptions } from '@pinceau/runtime'
import type { PinceauVueOptions } from '@pinceau/vue'
import type { PinceauOptions, PinceauUserOptions } from '../types'
import { merger } from './merger'

export function getDefaultOptions() {
  const theme: PinceauThemeOptions = {
    layers: [],
    configFileName: 'theme.config',
    configExtensions: ['.js', '.ts', '.mjs', '.cjs', '.json'],
    configResolved: [],
    configBuilt: [],
    outputFormats: [],
    tokensTransforms: [],
    buildDir: undefined,
    preflight: true,
    followSymbolicLinks: true,
    colorSchemeMode: 'media',
    componentMeta: false,
    definitions: true,
    schema: true,
    imports: true,
  }

  const style: PinceauStyleOptions = {
    includes: [],
    excludes: ['**/node_modules/**'],
  }

  const runtime: PinceauRuntimeOptions = {
    computedStyles: true,
    cssProp: true,
    variants: true,
    ssr: true,
    appId: false,
  }

  const vue: PinceauVueOptions = {
  /* */
  }

  const base: PinceauUserOptions = {
    cwd: undefined,
    debug: false,
    dev: process.env.NODE_ENV !== 'production',
    theme: true,
    style: true,
    runtime: true,
    vue: true,
  }

  return {
    theme,
    style,
    runtime,
    vue,
    base,
  }
}

export function normalizeOptions(options?: PinceauUserOptions): PinceauOptions {
  const defaults = getDefaultOptions()

  options = merger(options || {}, defaults.base)

  if (options.theme === true || typeof options.theme === 'object') {
    options.theme = merger(typeof options.theme === 'object' ? options.theme : {}, defaults.theme) as PinceauThemeOptions
  }
  if (options.style === true || typeof options.style === 'object') {
    options.style = merger(typeof options.style === 'object' ? options.style : {}, defaults.style) as PinceauStyleOptions
  }
  if (options.runtime === true || typeof options.runtime === 'object') {
    options.runtime = merger(typeof options.runtime === 'object' ? options.runtime : {}, defaults.runtime) as PinceauRuntimeOptions
  }
  if (options.vue === true || typeof options.vue === 'object') {
    options.vue = merger(typeof options.vue === 'object' ? options.vue : {}, defaults.vue) as PinceauVueOptions
  }

  return Object.assign({}, options) as PinceauOptions
}
