import { copyFile, mkdir } from 'node:fs/promises'
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
  ],
  hooks: {
    'build:done': async () => {
      await mkdir(resolve('./dist/runtime'), { recursive: true })
      await copyFile(resolve('./src/runtime/schema.server.mjs'), resolve('./dist/runtime/schema.server.mjs'))
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
    '#internal',
    '#internal/nitro',
    '#build',
    '#build/pinceau',
    '#build/pinceau/index',
    '#build/pinceau/utils',
    'nitropack',
    'nanoid',
    'chroma-js',
    'untyped',
    '@volar/language-core',
    '@volar/source-map',
    'muggle-string',
  ],
})
