import { cp } from 'node:fs/promises'
import { createResolver } from '@nuxt/kit'
import { defineBuildConfig } from 'unbuild'

// @ts-ignore
const { resolve } = createResolver(import.meta.url)

export default defineBuildConfig({
  entries: [
    'src/index',
    'src/vite',
    'src/nuxt',
    'src/utils',
    'src/runtime',
    'src/nitro',
    'src/volar',
    'src/transform',
  ],
  hooks: {
    'build:done': async () => {
      await cp(resolve('./src/runtime/schema.server.mjs'), resolve('./dist/runtime/schema.server.mjs'), { recursive: true })
    },
  },
  failOnWarn: false,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
    'chalk',
    'ohash',
    'vite',
    'pathe',
    'fast-glob',
    'ufo',
    '@nuxt/kit',
    'vue',
    '@vue',
    'vue/compiler-sfc',
    'style-dictionary-esm',
    'jiti',
    'tinycolor2',
    'pinceau',
    'pinceau/types',
    '#pinceau',
    '#pinceau/theme',
    '#pinceau/utils',
    'pinceau.css',
    '#imports',
    '#build/pinceau',
    '#build/pinceau/index',
    '#build/pinceau/utils',
    'nitropack',
    'nanoid',
    'chroma-js',
    'untyped',
  ],
})
