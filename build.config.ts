import { defineBuildConfig } from 'unbuild'

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
  failOnWarn: false,
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  externals: [
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
    '#pinceau',
    'nitropack',
    'nanoid',
  ],
})
