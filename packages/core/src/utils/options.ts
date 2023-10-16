import process from 'node:process'
import type { PinceauOptions, PinceauUserOptions } from '../types'
import { merger } from './merger'

export function getDefaultOptions(): { [key in keyof PinceauUserOptions]: any } & { base: any } {
  const theme: PinceauUserOptions['theme'] = {
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
    palette: true,
  }

  const style: PinceauUserOptions['style'] = {
    includes: [],
    excludes: ['**/node_modules/**'],
  }

  const runtime: PinceauUserOptions['runtime'] = {
    computedStyles: true,
    variants: true,
    ssr: {
      theme: true,
      runtime: true,
    },
    appId: false,
  }

  const vue: PinceauUserOptions['vue'] = {
    /* */
  }

  const astro: PinceauUserOptions['astro'] = {
    /* */
  }

  const react: PinceauUserOptions['react'] = {
    /* */
  }

  const svelte: PinceauUserOptions['svelte'] = {
    /* */
  }

  const base: PinceauUserOptions = {
    cwd: undefined,
    debug: false,
    dev: process.env.NODE_ENV !== 'production',

    // Core plugins, enabled by default
    theme: true,
    style: true,
    runtime: true,

    // Framework integrations, disabled by default
    vue: false,
    svelte: false,
    jsx: false,
    astro: false,
  }

  return {
    theme,
    style,
    runtime,
    vue,
    base,
    svelte,
    astro,
    react,
  }
}

export function normalizeOptions(options?: PinceauUserOptions): PinceauOptions {
  const defaults = getDefaultOptions()

  options = merger(options || {}, defaults.base)

  for (const [key, keyDefaults] of Object.entries(defaults)) {
    if (options[key] === true || typeof options[key] === 'object') {
      options[key] = merger(typeof options[key] === 'object' ? options[key] : {}, keyDefaults)
    }
  }

  return Object.assign({}, options) as PinceauOptions
}
